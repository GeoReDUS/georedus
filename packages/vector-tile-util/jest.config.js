export default {
  transform: {
    // Transform JavaScript files using Babel-Jest
    '^.+\\.m?(t|j)sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    // Ignore all node_modules except those that need transpiling
    // 'node_modules/(?!(dot-prop|@orioro/util)/)'
  ]
}
