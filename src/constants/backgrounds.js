/**
 * Background Images Configuration
 * Maps IDs/Filenames to display names
 */
export const BACKGROUNDS = [
    { id: 1, name: '亚津子', filename: '1.webp' },
    { id: 2, name: '圣园未花', filename: '2.webp' },
    { id: 3, name: '爱蜜莉雅', filename: '3.webp' },
    { id: 4, name: '芙莉莲', filename: '4.webp' },
    { id: 5, name: '动漫插画', filename: '5.webp' },
    { id: 6, name: '初音', filename: '6.webp' },
    { id: 7, name: '楪祈', filename: '7.webp' },
    { id: 8, name: 'girl', filename: '8.webp' },
    { id: 9, name: '祥子', filename: '9.webp' },
    { id: 10, name: '雪乃', filename: '10.webp' },
    { id: 11, name: '遐蝶', filename: '11.webp' },
    { id: 12, name: '默认背景', filename: '12.webp' }
]

export const DEFAULT_BACKGROUND = '12.webp'

export const getBackgroundUrl = (filename) => {
    return `/background/${filename}`
}

export const getThumbnailUrl = (filename) => {
    return `/thumbnails/${filename}`
}
