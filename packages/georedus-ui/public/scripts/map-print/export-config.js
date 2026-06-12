export const config = {
  // baseUrl: 'https://www.redus.org.br/georedus',
  baseUrl: 'http://localhost:6006/iframe.html?globals=&id=georedus-exportimage--basic&viewMode=story&v=v0',
  viewConf: 'N4IgRgngkgJiBcoAuBTAtgBxQJwIZIFc8B9AZwK2wDMBLAYxpQVBn12ZFUx3yNwCVcAOwDmTeAG0ATAAYANADYZAXQC%2BckDTjxO6SrxLlKtBk1XqQAG1wQA9gSQIJoLQisoqjjTS6knL7V1uPEJDChwTRhBVNTkAt2waEQALL01fJzU1IA',
  outputDir: './public/exported-images/',
  concurrency: 1,
  mapLoadTimeout: 30000,
  maxRetries: 2,
}