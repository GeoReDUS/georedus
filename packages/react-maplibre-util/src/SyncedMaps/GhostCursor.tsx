import styled from 'styled-components'

export const GhostCursor = styled.div`
  --synced-maps-ghost-cursor-size: 24px;
  position: absolute;

  height: 0;
  width: 0;
  color: inherit;

  &::before {
    content: '';
    display: block;
    background-color: currentColor;
    width: 1px;
    height: var(--synced-maps-ghost-cursor-size);
    position: absolute;
    top: calc(-1 * (var(--synced-maps-ghost-cursor-size) / 2));
    left: 0;
  }

  &::after {
    content: '';
    display: block;
    background-color: currentColor;
    height: 1px;
    width: var(--synced-maps-ghost-cursor-size);
    position: absolute;
    left: calc(-1 * (var(--synced-maps-ghost-cursor-size) / 2));
    top: 0;
  }
`
