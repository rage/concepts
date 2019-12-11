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
  },
  formControl: { 
    verticalAlign: 'middle', 
    marginLeft: '12px' 
  }
}))

export default useStyles
