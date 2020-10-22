import React, { useEffect, useState } from 'react'
import './App.css'
import { IAM } from 'iam-client-lib'
import axios from 'axios'
import { utils } from 'ethers'
import Button from '@material-ui/core/Button'
import { Typography } from '@material-ui/core'

const iam = new IAM({
  rpcUrl: 'https://volta-rpc.energyweb.org/',
  chainId: 73799,
})

type Role = {
  claimType: string
  createAt: string
  id: string
  issuedToken: string
  requester: string
}

function App() {
  const [address, setAddress] = useState<string>('')
  const [roles, setRoles] = useState<Role[]>([])
  useEffect(() => {
    async function init() {
      const { did } = await iam.initializeConnection()
      if (did) {
        setAddress(did.split(':')[2])
      }
    }
    init()
  }, [])

  const handleLogin = async () => {
    const message = new Date().toISOString()
    const signer = iam.getSigner()
    if (!signer) return null
    const hash = utils.hashMessage(message)
    const signedMessage = await signer.signMessage(utils.arrayify(hash))
    const { data } = await axios.post<Role[]>('/login', {
      address,
      signedMessage,
      message,
    })
    setRoles(data)
  }
  return (
    <div className="App">
      <header className="App-header">
        {roles && roles.length > 0 ? (
          <>
            <Typography>User roles:</Typography>
            {roles.map(({ claimType, id }) => (
              <p key={id}>{claimType}</p>
            ))}
          </>
        ) : (
          <Button variant="contained" color="primary" onClick={handleLogin}>
            login
          </Button>
        )}
      </header>
    </div>
  )
}

export default App
