import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  textfield: {
    margin: theme.spacing(1, 0)
  },
  submit: {
    margin: theme.spacing(1, 0)
  },
  cancel: {
    margin: theme.spacing(1, 0, 1, 1)
  },
  form: {
    width: '100%'
  }
}))

export default useStyles
