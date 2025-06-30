import { useState } from 'react'
import { ethers } from 'ethers'
import CertiChainAbi from '../artifacts/contracts/CertiChain.json'

const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS"

export default function Home() {
  const [account, setAccount] = useState(null)
  const [studentName, setStudentName] = useState('')
  const [course, setCourse] = useState('')
  const [ipfsHash, setIpfsHash] = useState('')
  const [certId, setCertId] = useState('')
  const [cert, setCert] = useState(null)

  async function connectWallet() {
    if (window.ethereum) {
      const [selectedAccount] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(selectedAccount)
    }
  }

  async function issueCertificate() {
    if (!account) return alert('Connect wallet first!')
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CertiChainAbi.abi, signer)
    const tx = await contract.issueCertificate(account, studentName, course, ipfsHash)
    const receipt = await tx.wait()
    const issuedEvent = receipt.events.find(e => e.event === 'CertificateIssued')
    setCertId(issuedEvent.args.certId)
    alert('Certificate issued!')
  }

  async function verifyCertificate() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CertiChainAbi.abi, provider)
    const result = await contract.verifyCertificate(certId)
    setCert(result)
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>CertiChain DApp</h1>
      <button onClick={connectWallet}>{account ? `Connected: ${account}` : 'Connect Wallet'}</button>
      <h2>Issue Certificate</h2>
      <input placeholder="Student Name" value={studentName} onChange={e => setStudentName(e.target.value)} /><br/>
      <input placeholder="Course" value={course} onChange={e => setCourse(e.target.value)} /><br/>
      <input placeholder="IPFS Hash" value={ipfsHash} onChange={e => setIpfsHash(e.target.value)} /><br/>
      <button onClick={issueCertificate}>Issue</button>

      <h2>Verify Certificate</h2>
      <input placeholder="Certificate ID" value={certId} onChange={e => setCertId(e.target.value)} /><br/>
      <button onClick={verifyCertificate}>Verify</button>
      {cert && (
        <div>
          <h3>Certificate Details</h3>
          <p>Student Name: {cert.studentName}</p>
          <p>Course: {cert.course}</p>
          <p>IPFS Hash: {cert.ipfsHash}</p>
          <p>Issued By: {cert.issuedBy}</p>
          <p>Issued At: {new Date(cert.issuedAt * 1000).toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}
