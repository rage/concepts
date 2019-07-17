import React, { useState } from 'react'

const ResourceForm = ({ createResource, conceptId }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [urls, setUrls] = useState([])
  const [visible, setVisible] = useState(false)

  const submit = async (event) => {
    event.preventDefault()

    if (name === '') {
      alert('Name can\'t be empty')
      return
    }
    await createResource({
      variables: { name, desc: description, urls, concept_id: conceptId }
    })

    setName('')
    setDescription('')
    setVisible(false)
  }

  const addAddress = () => {
    if (url === '') {
      alert('URL field can\'t be empty')
      return
    }
    setUrls(urls.concat(url))
    setUrl('')
  }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  return (
    <div>
      <form onSubmit={submit} style={{ display: visible ? '' : 'none' }}>
        <hr />
        <div>
          <label>Name </label>
          <input name='name' value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label>Description </label>
          <input
            name='description' value={description}
            onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div style={{ display: visible ? '' : 'none' }}>
          {urls.length > 0 &&
            <table>
              <tbody>
                {urls.map((address, index) => {
                  return (
                    <tr key={index}>
                      <td><a href={address}>{address}</a></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          }
          <div>
            <label>
              New url
            </label>
            <input name='url' value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <button type='button' onClick={addAddress}>Add url</button>
        </div>
        <button type='submit'>Create</button>
        <button type='button' onClick={toggleVisibility}>Cancel</button>
        <hr />
      </form>
      <button style={{ display: visible ? 'none' : '' }} onClick={toggleVisibility}>
        Create resource
      </button>
    </div>
  )
}

export default ResourceForm
