import React, { useEffect, useState } from "react";
import { Card, Container } from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css';

function Cards(props) {
    function renderCards() {
        const partyNames = props.partyNames;
        const description = props.description;
        const start = props.startTime;
        let startTime = new Date(0);
        startTime.setUTCSeconds(start);
        startTime = startTime.toString();
        const end = props.endTime;
        let endTime = new Date(0);
        endTime.setUTCSeconds(end);
        endTime = endTime.toString();
        const votingWindow = start < Math.floor(Date.now() / 1000) && Math.floor(Date.now() / 1000) < end;
        const firstStageLock = props.firstStageLock;
        
        const items = [
            {
                key: 1,
                header: <h3>List of Registered Parties</h3>,
                description: <p>{partyNames ? <div>
                    {partyNames.map((item, index) => (
                      <div key={index}>{item}</div>
                    ))}
                  </div> : "Empty"}</p>,
                style: { overflowWrap: 'break-word', backgroundColor: '#323232' }
            },
            {
                key: 2,
                header: <h3>Description</h3>,
                description: <p>{description ? description : "Empty"}</p>,
                style: { overflowWrap: 'break-word', backgroundColor: '#323232' }
            },
            {
                key: 3,
                header: <h3>Election Status</h3>,
                description: <h1>{firstStageLock ? 'Closed' : 'Open'}</h1>,
                style: { overflowWrap: 'break-word', backgroundColor: firstStageLock ? '#323232' : '#40BF60'}
            },
            {
                key: 4,
                header: <h3>Voting window</h3>,
                meta: <p>Opens: {startTime}</p>,
                description: <p>Closes: {endTime}</p>,
                style: { overflowWrap: 'break-word', backgroundColor: votingWindow ? '#40BF60' : '#323232' }
            }
        ];
        
        return <Card.Group items={items} />
    }
    
        return (
            <Container>
                {renderCards()}
            </Container>
        )

}
export default Cards;