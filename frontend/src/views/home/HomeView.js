import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Grid, Typography, Container } from '@material-ui/core'

import { useLoginStateValue } from '../../lib/store'
import UserViewContent from './UserViewContent'
import useRouter from '../../lib/useRouter'
import Auth from '../../lib/authentication'
import IntroductionCard from './components/IntroductionCard'

const useStyles = makeStyles(theme => ({
  icon: {
    marginRight: theme.spacing(2)
  },
  heroContent: {
    padding: theme.spacing(8, 0, 6)
  },
  heroButtons: {
    marginTop: theme.spacing(4)
  }
}))

const INTRODUCTION_CARDS = [
  {
    key: "intro-card-001",
    alt: "No alt set",
    title: "Concept mapping",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
    imageSource: "https://raw.githubusercontent.com/rage/concepts/master/preview-manager.png"
  },
  {
    key: "intro-card-002",
    alt: "No alt set",
    title: "Crowdsourcing",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
    imageSource: "https://raw.githubusercontent.com/rage/concepts/master/preview-mapper.png"
  },
  {
    key: "intro-card-003",
    alt: "Using course mapper",
    title: "Stucture study plan",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
    imageSource: "https://raw.githubusercontent.com/rage/concepts/master/preview-graph.png"
  }
]

const HomeView = () => {
  const classes = useStyles()
  const { history } = useRouter()

  const [{ loggedIn, user }, dispatch] = useLoginStateValue()

  if (loggedIn) {
    return <UserViewContent user={user} />
  }

  const createGuestAccount = async () => {
    const data = await Auth.GUEST.signIn()
    await dispatch({ type: 'login', data })
  }

  return (
    <main className={classes.heroContent}>
      <Container>
        <Typography component='h1' variant='h2' align='center' color='textPrimary' gutterBottom>
          Concepts
        </Typography>
        <Typography variant='h6' align='center' color='textSecondary' paragraph>
          The concepts tool provides the ability for study programmes to gain a better picture of
          their study plan, while students are able to practice mapping the concepts being taught,
          which boosts learning.
        </Typography>
        <Grid container direction="row" spacing={2} style={{ flexGrow: 1 }}>
          {
            INTRODUCTION_CARDS.map(card => 
              <Grid item xs={4} key={card.key} >
                <IntroductionCard 
                  title={card.title}
                  description={card.description}
                  alt={card.alt}
                  imageSource={card.imageSource} 
                />
              </Grid>
            )
          }
        </Grid>
        <div className={classes.heroButtons}>
          <Grid container spacing={2} justify='center'>
            <Grid item>
              <Button variant='contained' color='primary' onClick={() => history.push('/login')}>
                Login and choose workspace
              </Button>
            </Grid>
            <Grid item>
              <Button variant='outlined' color='primary' onClick={createGuestAccount}>
                Continue as guest
              </Button>
            </Grid>
          </Grid>
        </div>
      </Container>
    </main>
  )
}

export default HomeView
