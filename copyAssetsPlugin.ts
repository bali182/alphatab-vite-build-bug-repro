import * as path from 'path'
import * as fs from 'fs'
import type { Plugin } from 'vite'

export function copyAssetsPlugin(options: any): Plugin {
  let resolvedConfig: any
  let output = false

  return {
    name: 'vite-plugin-alphatab-copy',
    enforce: 'pre',
    configResolved(config: any) {
      resolvedConfig = config as any
    },
    buildEnd() {
      // reset for watch mode
      output = false
    },
    async buildStart() {
      // run copy only once even if multiple bundles are generated
      if (output) {
        return
      }
      output = true

      let alphaTabSourceDir = options.alphaTabSourceDir
      if (!alphaTabSourceDir) {
        alphaTabSourceDir = path.join(
          resolvedConfig.root,
          'node_modules/@coderline/alphatab/dist/',
        )
      }

      if (
        !alphaTabSourceDir ||
        !fs.promises.access(
          path.join(alphaTabSourceDir, 'alphaTab.mjs'),
          fs.constants.F_OK,
        )
      ) {
        resolvedConfig.logger.error(
          'Could not find alphaTab, please ensure it is installed into node_modules or configure alphaTabSourceDir',
        )
        return
      }

      const outputPath = (options.assetOutputDir ??
        resolvedConfig.publicDir) as string
      if (!outputPath) {
        return
      }

      async function copyFiles(subdir: string): Promise<void> {
        const fullDir = path.join(alphaTabSourceDir!, subdir)

        const files = await fs.promises.readdir(fullDir, {
          withFileTypes: true,
        })

        await fs.promises.mkdir(path.join(outputPath, subdir), {
          recursive: true,
        })

        await Promise.all(
          files
            .filter((f) => f.isFile())
            .map(async (file) => {
              const sourceFilename = path.join(file.path, file.name)
              console.log({
                'file.path': file.path,
                'file.name': file.name,
                sourceFilename: sourceFilename,
              })
              await fs.promises.copyFile(
                sourceFilename,
                path.join(outputPath!, subdir, file.name),
              )
            }),
        )
      }

      await Promise.all([copyFiles('font'), copyFiles('soundfont')])
    },
  }
}
