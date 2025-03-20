import { type IconType } from 'react-icons'

export const PublicIcon: IconType = (props) => (
  // eslint-disable-next-line react/react-in-jsx-scope
  <svg
    {...props}
    width="30"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* eslint-disable-next-line react/react-in-jsx-scope */}
    <text x="3" y="24" fontSize="30" fontWeight="bold" fill="white">P</text>
  </svg>
)
