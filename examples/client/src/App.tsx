import React, { useEffect, useState } from 'react'
import './App.css'
import { IAM, CacheServerClient } from 'iam-client-lib'
import axios from 'axios'
import Button from '@material-ui/core/Button'
import { Typography } from '@material-ui/core'

const cacheClient = new CacheServerClient({ url: 'http://13.52.78.249:3333' })

const iam = new IAM({
  rpcUrl: 'https://volta-rpc-vkn5r5zx4ke71f9hcu0c.energyweb.org/',
  chainId: 73799,
  cacheClient,
})

type Role = {
  name: string
  namespace: string
}

type User = {
  did: string
  verifiedRoles: Role[]
}

function App() {
  const [roles, setRoles] = useState<Role[]>([])
  const [myDid, setMyDid] = useState<string>('')

  useEffect(() => {
    async function init() {
      const { did } = await iam.initializeConnection()
      if (did) {
        setMyDid(did)
      }
    }
    init()
  }, [])

  const handleLogin = async () => {
    const myRoles = await iam.getRequestedClaims({ did: myDid, isAccepted: true})
    const signer = iam.getSigner()
    const latestBlock = await signer?.provider?.getBlockNumber()
    // const myRoles = [
    //   {
    //     claimType: 'daniel.roles.apple.apps.daniel.iam.ewc',
    //     issuedToken:
    //       'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJkaWQiOiJkaWQ6ZXRocjoweDhjMjRFZkQ3Yzg0YTE4YzkzZDM0MjMwMTM4RTAwNEU1NWM3MGQ5NWQiLCJzaWduZXIiOiJkaWQ6ZXRocjoweDhjMjRFZkQ3Yzg0YTE4YzkzZDM0MjMwMTM4RTAwNEU1NWM3MGQ5NWQiLCJjbGFpbURhdGEiOnsiZmllbGRzIjpbeyJrZXkiOiJuYW1lIiwidmFsdWUiOiJEYW5pZWwifV0sImNsYWltVHlwZSI6ImFwcGxlLmFwcHMuZGFuaWVsLmlhbS5ld2MifSwic3ViIjoiIiwiaWF0IjoxNjAyODU1ODY0NjcwLCJpc3MiOiJkaWQ6ZXRocjoweDhjMjRFZkQ3Yzg0YTE4YzkzZDM0MjMwMTM4RTAwNEU1NWM3MGQ5NWQifQ.MHg2YzVmYzUxMTc3NGMxYThlMmY3ZWExMzNkOGEwYjgyMTFkZTc3N2ZiNTgwOTBhOWRlMWJkZTE5Mjk1NGQ2ZTU2MDQ1ZjJlMDE1ZjM0YmY4YjlmNTNhNTg5YTAzMWQ1MmM2ZDJlMzAyOGM2MmRlNGQ5NmVlY2I0N2IzZmU5MTU5NDFi',
    //   },
    // ]
    const claim = await iam.createPublicClaim({
      data: { blockNumber: latestBlock, roleClaims: myRoles },
    })
    const { data } = await axios.post<{ token: string }>('/login', {
      claim,
    })
    const config = {
      headers: { Authorization: `Bearer ${data.token}` },
    }
    const { data: roles } = await axios.get<Role[]>('/roles', config)
    const { data: user } = await axios.get<User>('/user', config)

    setRoles(roles)
  }
  return (
    <div className="App">
      <header className="App-header">
        {roles && roles.length > 0 ? (
          <>
            <Typography>User roles:</Typography>
            {roles.map(({ name, namespace }) => (
              <p key={namespace}>{`${name} at ${namespace}`}</p>
            ))}
          </>
        ) : null}
        <Button variant="contained" color="primary" onClick={handleLogin}>
          login
        </Button>
      </header>
    </div>
  )
}

export default App
