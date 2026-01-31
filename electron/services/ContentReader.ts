/**
 * 内容读取器 - 读取文件内容
 */
import { promises as fs } from 'fs'

export class ContentReader {
  private maxFileSize = 10 * 1024 * 1024 // 10MB

  /**
   * 读取文件内容
   */
  async read(filePath: string): Promise<string | null> {
    try {
      // 检查文件大小
      const stats = await fs.stat(filePath)
      if (stats.size > this.maxFileSize) {
        console.warn(`File too large, skipping: ${filePath}`)
        return null
      }

      // 读取文件内容
      const content = await fs.readFile(filePath, 'utf-8')
      return content
    } catch (error) {
      console.error(`Failed to read file: ${filePath}`, error)
      return null
    }
  }
}
