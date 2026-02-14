
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ajv = new Ajv({ allErrors: true });

// 配置架构定义
const schema = {
  type: "object",
  required: ["version", "meta", "seo", "contact"],
  properties: {
    version: { type: "string" },
    meta: {
      type: "object",
      required: ["siteName"],
      properties: {
        siteName: { type: "string", minLength: 1 },
        beianNumber: { type: "string" },
        legal: {
          type: "object",
          properties: {
            company: { type: "string" },
            address: { type: "string" },
            license: { type: "string" }
          }
        }
      }
    },
    seo: {
      type: "object",
      properties: {
        titleTemplate: { type: "string" },
        defaultDescription: { type: "string" },
        keywords: { type: "string" }
      }
    },
    contact: {
      type: "object",
      properties: {
        email: { type: "string" }, // 可以添加 format: "email" 如果安装了 ajv-formats
        phone: { type: "string" },
        wechat: { type: "string" }
      }
    }
  }
};

const configPath = path.resolve(__dirname, '../public/config/site.json');

// 敏感词检查
const SENSITIVE_KEYS = ['key', 'secret', 'token', 'password', 'private'];

function verifyConfig() {
  console.log('Verifying site configuration...');
  
  if (!fs.existsSync(configPath)) {
    console.error('Error: public/config/site.json not found!');
    process.exit(1);
  }

  const configContent = fs.readFileSync(configPath, 'utf8');
  let config;
  
  try {
    config = JSON.parse(configContent);
  } catch (e) {
    console.error('Error: Invalid JSON format in site.json');
    process.exit(1);
  }

  // Schema 验证
  const validate = ajv.compile(schema);
  const valid = validate(config);

  if (!valid) {
    console.error('Configuration validation failed:');
    validate.errors.forEach(err => {
      console.error(`- ${err.instancePath} ${err.message}`);
    });
    process.exit(1);
  }

  // 敏感信息检查
  const contentLower = configContent.toLowerCase();
  const foundSensitive = SENSITIVE_KEYS.filter(key => contentLower.includes(key));
  
  if (foundSensitive.length > 0) {
    console.warn('WARNING: Potential sensitive keys found in configuration:');
    foundSensitive.forEach(key => console.warn(`- ${key}`));
    console.warn('Please ensure no secrets are committed to version control.');
  }

  console.log('Configuration verification passed successfully! ✅');
}

verifyConfig();
