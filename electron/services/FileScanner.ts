/**
 * 文件扫描器 - 遍历站点文件
 */
import { promises as fs } from 'fs'
import path from 'path'
import type { Site } from '../../src/types'

export class FileScanner {
  private excludePatterns = [
    /node_modules/,
    /\.git/,
    /\.svn/,
    /\.hg/,
    /dist/,
    /build/,
    /coverage/,
    /\.cache/,
    /\.temp/,
    /\.tmp/
  ]

  private includeExtensions = ['.md', '.mdx', '.markdown', '.txt']

  /**
   * 扫描站点获取可搜索文件列表
   */
  async scan(sites: Site[]): Promise<string[]> {
    const files: string[] = []

    for (const site of sites) {
      if (!site.path) continue
      const siteFiles = await this.scanDirectory(site.path)
      files.push(...siteFiles)
    }

    return files
  }

  /**
   * 递归扫描目录
   */
  private async scanDirectory(dirPath: string): Promise<string[]> {
    const files: string[] = []

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)

        // 检查是否应该排除
        if (this.shouldExclude(fullPath)) {
          continue
        }

        if (entry.isDirectory()) {
          // 递归扫描子目录
          const subFiles = await this.scanDirectory(fullPath)
          files.push(...subFiles)
        } else if (entry.isFile() && this.isValidFile(fullPath)) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      console.error(`Failed to scan directory: ${dirPath}`, error)
    }

    return files
  }

  /**
   * 检查路径是否应该被排除
   */
  private shouldExclude(filePath: string): boolean {
    return this.excludePatterns.some(pattern => pattern.test(filePath))
  }

  /**
   * 检查文件是否是有效的搜索目标
   */
  private isValidFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase()
    return this.includeExtensions.includes(ext)
  }
}
