import tmcClient from 'tmc-client-js'
import axios from 'axios'

const clientId = process.env.REACT_APP_TMC_CLIENT_ID
const tmcSecret = process.env.REACT_APP_TMC_SECRET
const client = new tmcClient(clientId, tmcSecret)

export const getUser = () => client.getUser()

export const isSignedIn = () => {
}

export const isAdmin = () => {
}

export const signIn = async ({
  email,
  password,
}) => {
  const res = await client.authenticate({ username: email, password })

  const details = await userDetails(res.accessToken)
  const firstName = details ? details.user_field.first_name : ""
  const lastName = details ? details.user_field.last_name : ""

  window.localStorage.setItem('acces_token', res)

  console.log("first name", firstName, "last name", lastName)
  if (firstName === "" || lastName === "") {
    throw new Error("Etunimi tai sukunimi puuttuu.")
  }
  return res
}

export const signOut = async (apollo) => {
  await apollo.resetStore().then(() => {
    client.unauthenticate()
  })
}

export async function userDetails(accessToken) {
  const res = await axios.get(
    `https://tmc.mooc.fi/api/v8/users/current?show_user_fields=true`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
  return res.data
}