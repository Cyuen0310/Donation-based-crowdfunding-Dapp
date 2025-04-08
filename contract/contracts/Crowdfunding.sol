// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

// chainlink automation compatible interface
contract CrowdFunding is AutomationCompatibleInterface {
    struct Campaign {
        address payable owner;
        string title;
        string description;
        uint256 target;
        uint256 duration;
        uint256 deadline;
        uint256 fundedAmount;
        uint256 numberOfBackers;
        bool isActive;
        bool isCollected;
        mapping(address => uint256) backers; // campaign[id].backers[address] = amount
        address[] backerList;  
    }

    uint256 public TotalCampaigns = 0;
    mapping(uint256 => Campaign) private campaigns; 
    mapping(address => uint256[]) public backedCampaigns; // backedCampaigns[address] = [id, id] # array of  users backed campaigns
    mapping(address => uint256[]) public createdCampaigns; // createdCampaigns[address] = [id, id] # array of  users created campaigns

    event backedcampaign(uint256 indexed id, address indexed backer, uint256 amount);
    event createdcampaign(uint256 indexed id, address indexed owner, string title, string description, uint256 target, uint256 duration);
    event withdrawfund(uint256 indexed id, address indexed owner, uint256 amount);

    // create a campaign
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _duration
    ) public returns (uint256) {
        require(_target > 0, "Campaign target must be larger than 0");
        require(_duration > 0, "Campaign duration must at least be 1 day");
        uint256 campaignId = TotalCampaigns;
        Campaign storage campaign = campaigns[campaignId];

        campaign.owner = payable(msg.sender);
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.duration = _duration;
        campaign.deadline = block.timestamp + _duration * 1 days;
        campaign.fundedAmount = 0;
        campaign.numberOfBackers = 0;
        campaign.isActive = true;
        campaign.isCollected = false;

        TotalCampaigns++;
        createdCampaigns[msg.sender].push(campaignId);
        emit createdcampaign(campaignId, msg.sender, _title, _description, _target, _duration);
        return campaignId;
    }

    // back/donate to a campaign
    function backCampaign(uint256 _id) public payable {
        uint256 fundingValue = msg.value;
        require(fundingValue > 0, "Funding value must be larger than 0");
        Campaign storage campaign = campaigns[_id];
        require(campaign.isActive, "Campaign is not active");
        require(campaign.deadline > block.timestamp, "Campaign has ended");

        if (campaign.backers[msg.sender] == 0) {
            campaign.numberOfBackers++;
            campaign.backerList.push(msg.sender); 
        }

        campaign.backers[msg.sender] += fundingValue;
        campaign.fundedAmount += fundingValue;
        backedCampaigns[msg.sender].push(_id);

        emit backedcampaign(_id, msg.sender, fundingValue);
    }

    // Chainlink Automation: off-chain node constantly checking if the campaign is able to be collected (still Active, not Collected, and either meet the target or the deadline has passed)
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        for (uint256 i = 0; i < TotalCampaigns; i++) {
            Campaign storage campaign = campaigns[i];
            if (
                campaign.isActive &&
                !campaign.isCollected &&
                (campaign.fundedAmount >= campaign.target || campaign.deadline < block.timestamp)
            ) {
                return (true, abi.encode(i));
            }
        }
        return (false, "");
    }

    // Chainlink Automation: if checkUpkeep returns true, automatically transfer the funded amount to the campaign owner
    function performUpkeep(bytes calldata performData) external override {
        uint256 campaignId = abi.decode(performData, (uint256));
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.isActive, "Campaign already ended");
        require(!campaign.isCollected, "Funds already withdrawn");

        uint256 amount = campaign.fundedAmount;
        (bool success, ) = campaign.owner.call{value: amount}("");
        require(success, "Transfer failed");

        campaign.isCollected = true;
        campaign.isActive = false;

        emit withdrawfund(campaignId, campaign.owner, amount);
    }

    // get all campaigns that a user has contributed 
    function getBackedCampaigns(address _backer) public view returns (uint256[] memory) {
        return backedCampaigns[_backer];
    }

    // get all campaigns that a user has created
    function getCreatedCampaigns(address _owner) public view returns (uint256[] memory) {
        return createdCampaigns[_owner];
    }

    // get the amount a user has contributed to a campaign
    function getContribution(uint256 _id, address _user) public view returns (uint256) {
        return campaigns[_id].backers[_user];
    }

    // get all users who have donated to that campaign
    function getAllContributions(uint256 _id) public view returns (address[] memory, uint256[] memory) {
        Campaign storage campaign = campaigns[_id];
        uint256 backerCount = campaign.backerList.length;
        address[] memory backers = new address[](backerCount);
        uint256[] memory contributions = new uint256[](backerCount);

        for (uint256 i = 0; i < backerCount; i++) {
            address backer = campaign.backerList[i];
            backers[i] = backer;
            contributions[i] = campaign.backers[backer];
        }

        return (backers, contributions);
    }
}
