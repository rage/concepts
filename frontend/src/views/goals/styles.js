import { makeStyles } from '@material-ui/core/styles'

const lineMask = {
  position: 'absolute',
  backgroundColor: '#eee',
  zIndex: 5
}

export const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: '1408px',
    margin: '0 auto',
    display: 'grid',
    overflow: 'hidden',
    gridGap: '16px',
    gridTemplate: `"header  header header" 56px
                   "courses space  goals"  1fr
                  / 1fr     128px  1fr`,
    '@media screen and (max-width: 1440px)': {
      width: 'calc(100% - 32px)'
    }
  },
  card: {
    ...theme.mixins.gutters(),
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  courses: {
    gridArea: 'courses'
  },
  goals: {
    gridArea: 'goals'
  },
  list: {
    overflow: 'auto'
  },
  title: {
    gridArea: 'header',
    zIndex: 7
  },
  activeCircle: {
    zIndex: 2
  },
  circle: {
    zIndex: 2
  },
  listItemContainer: {
    padding: '0 16px',
    '&:hover': {
      '& $hoverButton': {
        visibility: 'visible'
      }
    }
  },
  hoverButton: {
    visibility: 'hidden'
  },

  // Below is a whole bunch of hacky masking CSS to hide goal links from places
  // they're not supposed to be in.

  // This one makes the new goal and new course forms take the full width of
  // their cards, and then makes them opaque and white
  formWithMask: {
    zIndex: 7,
    backgroundColor: theme.palette.background.paper,
    transform: 'translateX(-24px)',
    width: 'calc(100% + 48px)',
    padding: '0 24px'
  },

  // These make blank spaces opaque.

  // This one is between the new course and new goal forms
  bottomMiddleLineMask: {
    ...lineMask,
    height: '200px',
    width: '160px',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: '64px'
  },
  // This one is at the bottom, between the content and workspace navbar
  bottomLineMask: {
    ...lineMask,
    width: '100%',
    bottom: '56px',
    height: '10px'
  },
  // This one is at the top between the cards and the topbar (in the same spot as the header)
  topLineMask: {
    ...lineMask,
    width: '100%',
    height: '82px',
    left: 0,
    transform: 'translateY(-10px)'
  }
}))
