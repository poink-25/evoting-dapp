import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { ethers } from "ethers";
import { Container, Grid, Button, Form, Input, Divider, Message } from "semantic-ui-react";
import Cards from "../../components/Cards";
import ResultsTable from "../../components/Table";
import Election from '../../artifacts/contracts/eVote.sol/Election.json';
import 'semantic-ui-css/semantic.min.css';

function App() {
    ///State Variables
    //General
    const [election, setElection] = useState(null);
    //Loading and Error
    const [loading1, setLoading1] = useState(false);
    const [errorMessage1, setErrorMessage1] = useState('');
    const [loading2, setLoading2] = useState(false);
    const [errorMessage2, setErrorMessage2] = useState('');
    const [loading3, setLoading3] = useState(false);
    const [errorMessage3, setErrorMessage3] = useState('');
    const [loading4, setLoading4] = useState(false);
    const [errorMessage4, setErrorMessage4] = useState('');
    const [loading5, setLoading5] = useState(false);
    const [errorMessage5, setErrorMessage5] = useState('');
    //Contract Address
    const { query } = useRouter();
    //Contract Data
    const [partiesList, setPartiesList] = useState([]);
    const [partyNames, setPartyNames] = useState([]);
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [firstStageLock, setFirstStageLock] = useState(false);
    const [secondStageLock, setSecondStageLock] = useState(false);
    //Form Data
    const [vote, setVote] = useState(null);
    const [newDescription, setNewDescription] = useState(null);
    const [newStartTime, setNewStartTime] = useState(null);
    const [newEndTime, setNewEndTime] = useState(null);
    const [newPartyName, setNewPartyName] = useState(null);
    const [threshold, setThreshold] = useState(null);
    //Visibility Control
    const [showVote, setShowVote] = useState(false);
    const [showManageElection, setShowManageElection] = useState(false);
    const [showFirstStage, setShowFirstStage] = useState(false);
    const [showSecondStage, setShowSecondStage] = useState(false);
    const [showResults, setShowResults] = useState(false);
    
    useEffect(() => {
        const init = async () => {
            //Initialize
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const currentAccount = accounts[0];
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const election = new ethers.Contract(query.address, Election.abi, signer);
            //Get contract data
            const partiesList = await election.getPartiesList();
            let partyNames = [];
            for (let i = 1; i < partiesList.length; i++) {
                partyNames.push(i+": "+partiesList[i][0]);
            }
            const description = await election.description();
            const startTime = await election.startTime();
            const endTime = await election.endTime();
            const firstStageLock = await election.firstStageLock();
            const secondStageLock = await election.secondStageLock();
            //Check if user is moderator
            const moderators = await election.getModeratorsList();
            let isModerator = false;
            for (let moderator of moderators) {
                if (moderator.toLowerCase() === currentAccount.toLowerCase()) {
                    isModerator = true;
                    break;
                 }
            }
            //Visibility Control
            if (startTime < Math.floor(Date.now() / 1000) && Math.floor(Date.now() / 1000) < endTime && !firstStageLock && !secondStageLock) {
                setShowVote(true);
            } else {
                setShowVote(false);
            }
            if (!isModerator && !firstStageLock && !secondStageLock) {
                setShowManageElection(false);
                setShowFirstStage(false);
                setShowSecondStage(false);
                setShowResults(false);
            } else if (isModerator && !firstStageLock && !secondStageLock) {
                setShowManageElection(true);
                setShowFirstStage(true);
                setShowSecondStage(false);
                setShowResults(false);
            } else if (isModerator && firstStageLock && !secondStageLock) {
                setShowManageElection(false);
                setShowFirstStage(false);
                setShowSecondStage(true);
                setShowResults(true);
            } else {
                setShowManageElection(false);
                setShowFirstStage(false);
                setShowSecondStage(false);
                setShowResults(true);
            }
            
            //Set state
                setElection(election);
                setPartiesList(partiesList);
                setPartyNames(partyNames);
                setDescription(description);
                setStartTime(startTime);
                setEndTime(endTime);
                setFirstStageLock(firstStageLock);
                setSecondStageLock(secondStageLock);
            }
            init();
    }, []);
    
    //Vote Form
    const onVote = async () => {
        setLoading1(true);
        try {
            const formatedVote = vote.split(',').map(voteID => parseInt(voteID.trim(), 10));
            await election.vote(formatedVote[0], formatedVote[1]);
        } catch (err) {
            setErrorMessage1(err.message);
        }
        setLoading1(false);
    };
    
     //Manage Form
     const onManage = async () => {
        setLoading2(true);
        try {
            await election.changeParameters(newDescription, newStartTime, newEndTime);
        } catch (err) {
            setErrorMessage2(err.message);
        }
        setLoading2(false);
    };
    
    //Add Party Form
    const onAdd = async () => {
        setLoading3(true);
        try {
            await election.addParty(newPartyName);
        } catch (err) {
            setErrorMessage3(err.message);
        }
        setLoading3(false);
    };
    
    //First Stage Form
    const onFirst = async () => {
        setLoading4(true);
        try {
            await election.callFirstStage();
        } catch (err) {
            setErrorMessage4(err.message);
        }
        setLoading4(false);
    };
    
    //Second Stage Form
    const onSecond = async () => {
        setLoading5(true);
        try {
            await election.callSecondStage(threshold);
        } catch (err) {
            setErrorMessage5(err.message);
        }
        setLoading5(false);
    };

        return (
            <div style={{ height: '100%', width: '100%', position: 'absolute', backgroundColor: '#242424', color: 'white'}}>
                <Container>
                <Grid>
                    <Grid.Row>
                        
                    {/*Dashboard*/}
                    <Grid.Column width={10}>
                    <h1 style={{marginTop:'20px'}}>Election Details</h1>
                    <p>Address: {query.address}</p>
                        <Cards partyNames={partyNames} description={description.toString()} 
                            startTime={startTime.toString()} endTime={endTime.toString()} firstStageLock={firstStageLock}/>
                    <Divider inverted />
                    
                    {/*Results Display*/}
                    {showResults && <div>
                    <h1>Results</h1>
                    <ResultsTable partiesList={partiesList} secondStageLock={secondStageLock}/>
                    <Divider inverted />
                    </div>}
                    
                    {/*Back Button*/}
                    <Button href='../'>Back</Button>
                    </Grid.Column>
                    <Grid.Column width={6}>
                        
                    {/*Vote Form*/}
                    {showVote && <div>
                    <h1 style={{marginTop:'20px'}}>Vote</h1>
                        <Form onSubmit={onVote} error={!!errorMessage1}>
                        <p>Enter the Party ID of your Primary vote followed by your Alternative vote separated by a comma.</p>
                        <p>Enter 0 to cast a Blank vote.</p>
                            <Form.Field>
                                <Input label='Primary, Alternative' labelPosition='right' value={vote}
                                    onChange={event => setVote(event.target.value)}/>
                            </Form.Field>
                            <Message error header='Error' content={errorMessage1} />
                            <Button loading={loading1} primary>Submit</Button>
                        </Form>
                        <Divider inverted />
                        </div>}
                    
                    {/*Manage Form*/}
                    {showManageElection && <div>
                    <h3 style={{marginTop:'10px'}}>Manage Election</h3>
                        <Form onSubmit={onManage} error={!!errorMessage2}>
                        <p>Change Election Details</p>
                            <Form.Field>
                                <Input label='Description' labelPosition='right' value={newDescription}
                                    onChange={event => setNewDescription(event.target.value)}/>
                            </Form.Field>
                            <Form.Field>
                                <Input label='Start Time (s)' labelPosition='right' value={newStartTime}
                                    onChange={event => setNewStartTime(event.target.value)}/>
                            </Form.Field>
                            <Form.Field>
                                <Input label='End Time (s)' labelPosition='right' value={newEndTime}
                                    onChange={event => setNewEndTime(event.target.value)}/>
                            </Form.Field>
                            <Message error header='Error' content={errorMessage2} />
                            <Button loading={loading2} primary>Submit</Button>
                        </Form>
                        
                    {/*Add Party Form*/}
                        <Form onSubmit={onAdd} error={!!errorMessage3}>
                        <p>Add Party</p>
                            <Form.Field>
                                <Input label='Party Name' labelPosition='right' value={newPartyName}
                                    onChange={event => setNewPartyName(event.target.value)}/>
                            </Form.Field>
                            <Message error header='Error' content={errorMessage3} />
                            <Button loading={loading3} primary>Add</Button>
                        </Form>
                        <Divider inverted />
                        </div>}
                        
                    {/*Call Stage 1 Form*/}
                    {showFirstStage && <div>
                        <Form onSubmit={onFirst} error={!!errorMessage4}>
                            <Button loading={loading4} primary>Call First Stage</Button>
                            <Message error header='Error' content={errorMessage4} />
                        </Form>
                        </div>}
                        
                    {/*Call Stage 2 Form*/}
                    {showSecondStage && <div style={{marginTop:'20px'}}>
                        <Form onSubmit={onSecond} error={!!errorMessage5}>
                            <Form.Field>
                                <Input label='Electoral Threshold' labelPosition='right' value={vote}
                                    onChange={event => setThreshold(event.target.value)}/>
                            </Form.Field>
                            <Button loading={loading5} primary>Call Second Stage</Button>
                            <Message error header='Error' content={errorMessage5} />
                        </Form>
                        </div>}
                    </Grid.Column>
                    </Grid.Row>
                </Grid>
                </Container>
            </div>
        );
}

export default App;