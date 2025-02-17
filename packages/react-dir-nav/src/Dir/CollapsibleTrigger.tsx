import * as Collapsible from '@radix-ui/react-collapsible'
import styled from 'styled-components'

export const CollapsibleTrigger = styled(Collapsible.Trigger)`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  background-color: var(--dir-nav-surface-color);
  color: var(--accent-9);
  border: none;
  padding: 6px 8px;
  font-size: 1rem;
  cursor: pointer;

  > div:first-child {
    display: flex;
    flex-shrink: 0;
    flex-grow: 0;
    margin-left: -6px;
    margin-right: 10px;
  }

  &[data-state='open'] {
    border-bottom: 1px solid var(--dir-nav-separator-color);
  }
`
