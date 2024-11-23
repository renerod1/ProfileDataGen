import { getHeatmapData } from './commitHeatMap'
import { getWordCloudData } from './wordCloud'
import { getRepoCommitsList } from './repositoryCommitList'
import { getRepositoryList } from './repositoryList'
import { vegaCommitHeatmap } from './commitHeatMap/util/vegaCommitHeatMap'
import { vegaWordCloud } from './wordCloud/util/vegaWordCloud'
import { generateAnimatedGif } from './animateImages'
import { getProfileReadme } from './profileReadme'
import dotenv from 'dotenv'
import fs from 'fs'
import dayjs from 'dayjs'

dotenv.config()
const isDebugMode = process.env.DEBUG_MODE == 'true'
const enableWordCloud = process.env.GENERATE_WORD_CLOUD == 'true'
const enableCommitHeatmap = process.env.GENERATE_COMMIT_HEATMAP == 'true'

//Get list of Repos
const listOfRepos = await getRepositoryList()
console.log('Get list of Repos - Complete')

if (isDebugMode)
  listOfRepos.map(v => console.log('listOfRepos:', v.toLowerCase()))

//Get all commits per Repos
const listOfRepoCommits = await getRepoCommitsList(listOfRepos)
console.log('Get all commits per Repos - Complete')

if (enableWordCloud) {
  // Get Word Cloud Data
  const wordCloudWords = getWordCloudData(listOfRepoCommits)

  // Create Word Cloud Image
  await vegaWordCloud(wordCloudWords)
  console.log('Create Word Cloud - Complete')
}

if (enableCommitHeatmap) {
  // Get Commit Heatmap Data
  const heatMapDict = getHeatmapData(listOfRepoCommits)

  // Create Commit Heatmap Image
  await vegaCommitHeatmap(heatMapDict)
  console.log('Create Commit Heatmap - Complete')
}

// Create Animated Image
await generateAnimatedGif()
console.log('Create Animated Image - Complete')

// Clean up datavisuals temp directory
fs.rmSync('DataVisuals/temp', { recursive: true, force: true })

// Get Base Readme
const readme = await getProfileReadme()
console.log('Get Current Profile Readme - Complete')

readme.push('---\n\n')

// Add metrics
const owner: string = process.env.OWNER ?? ''
const githubRunId = process.env.GITHUB_RUN_ID
const timestamp = dayjs().format('YYYY-MM-DD')

readme.push(
  `### Data last generated on: ${timestamp} via [GitHub Action ${githubRunId}](https://github.com/${owner}/${owner}/actions/runs/${githubRunId})\n\n`
)
readme.push('![](DataVisuals/data.gif)\n\n')

fs.mkdirSync('Profile', { recursive: true })
fs.writeFileSync('Profile/README.md', readme.join(''))

console.log('Create Profile Readme - Complete')
