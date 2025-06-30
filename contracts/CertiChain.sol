// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertiChain {
    struct Certificate {
        string studentName;
        string course;
        string ipfsHash;
        uint256 issuedAt;
        address issuedBy;
    }

    address public admin;
    mapping(address => bool) public isIssuer;
    mapping(bytes32 => Certificate) public certificates;

    event CertificateIssued(bytes32 indexed certId, address indexed student, string ipfsHash);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyIssuer() {
        require(isIssuer[msg.sender], "Not issuer");
        _;
    }

    constructor() {
        admin = msg.sender;
        isIssuer[msg.sender] = true;
    }

    function addIssuer(address issuer) external onlyAdmin {
        isIssuer[issuer] = true;
    }

    function issueCertificate(
        address student,
        string memory studentName,
        string memory course,
        string memory ipfsHash
    ) external onlyIssuer returns (bytes32) {
        bytes32 certId = keccak256(abi.encodePacked(student, course, ipfsHash, block.timestamp));
        certificates[certId] = Certificate({
            studentName: studentName,
            course: course,
            ipfsHash: ipfsHash,
            issuedAt: block.timestamp,
            issuedBy: msg.sender
        });
        emit CertificateIssued(certId, student, ipfsHash);
        return certId;
    }

    function verifyCertificate(bytes32 certId) external view returns (Certificate memory) {
        return certificates[certId];
    }
}
