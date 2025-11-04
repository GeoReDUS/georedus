import { DevContext } from '../src/DevContext'
import '@radix-ui/themes/styles.css'
import './global.css'

/** @type { import('@storybook/react').Preview } */
const preview = {
  decorators: [
    (Story) => (
      <DevContext>
        <Story />
      </DevContext>
    ),
  ],
}

export default preview
