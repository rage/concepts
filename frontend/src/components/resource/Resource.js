import React from 'react'

const Resource = ({ resource }) => {
  return (
    <div>
      <table className='resourceDetails'>
        <tbody>
          <tr>
            <td>{resource.id}</td>
          </tr>
          <tr>
            <td>{resource.name}</td>
          </tr>
          <tr>
            <td>{resource.description}</td>
          </tr>
        </tbody>
      </table>

      <table className='resourceUrls'>
        <thead>
          <th></th>
        </thead>
        <tbody>
          {
            resource.urls.map(url => {
              return (
                <tr key={url.id}>
                  <td>
                    <a href={url.address}>{url.address}</a>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  )
}

export default Resource
