import { githubClient } from '../../client'
import {
  type GetProfileReadmeQueryVariables,
  type GetProfileReadmeQuery,
  GetProfileReadme,
} from '../../types'
import type { Blob } from './request'
import dotenv from 'dotenv'

dotenv.config()
const isDebugMode = process.env.DEBUG_MODE == 'true'

export const useGetProfileReadme = async (): Promise<string[]> => {
  async function getData(): Promise<string[]> {
    let owner: string = process.env.GITHUB_OWNER ?? ''
    let name: string = process.env.GITHUB_USER ?? ''
    let variables: GetProfileReadmeQueryVariables = {
      owner: owner,
      name: name,
    }
    let readme: string[] = []

    if (isDebugMode) console.log(`owner: ${owner}, name: ${name}`)
    const result = await githubClient()
      .query<GetProfileReadmeQuery>({
        query: GetProfileReadme,
        variables: variables,
      })
      .then(response => response.data)

    const readmeText = (result.repository?.object as Blob).text

    if (isDebugMode) console.log('readmeText:\n', readmeText)

    if (isDebugMode) console.log('readme:\n', readme)

    readme.push(readmeText?.split('---')[0] ?? '')

    if (isDebugMode) console.log('readme', readme)

    return readme
  }

  return await getData()
}

export default useGetProfileReadme
