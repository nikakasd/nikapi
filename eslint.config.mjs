import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
  typescript: true,
  rules: {
    'antfu/no-top-level-await': 'off',
    'no-console': 'off',
  },
})
