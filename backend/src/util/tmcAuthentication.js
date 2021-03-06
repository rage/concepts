import axios from 'axios'

// TODO PR this into tmc-client-js
export async function userDetails(accessToken) {
  const res = await axios.get(
    'https://tmc.mooc.fi/api/v8/users/current?show_user_fields=true',
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    }
  )
  return res.data
}
