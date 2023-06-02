import React from 'react'
import { Table, Icon } from 'semantic-ui-react'

function ResultsTable(props) {
    const partiesList = props.partiesList;
    const secondStageLock = props.secondStageLock;
    let tableRows = [];
    for (let i = 0; i < partiesList.length; i++) {
        const names = partiesList[i][0];
        const votes = partiesList[i][1].toString();
        let threshold;
        if (partiesList[i][2] === false){
            threshold = <Icon color='green' name='checkmark' size='large' />
        } else {
            threshold = <Icon color='red' name='close' size='large' />
        }
    
        tableRows.push(
          <Table.Row key={i}>
            <Table.Cell>{names}</Table.Cell>
            <Table.Cell>{votes}</Table.Cell>
            {secondStageLock && 
            <Table.Cell>{threshold}</Table.Cell>
            }
          </Table.Row>
        );
      }
    return(
    <Table celled>
        <Table.Header>
            <Table.Row>
                <Table.HeaderCell>Party</Table.HeaderCell>
                <Table.HeaderCell>Votes</Table.HeaderCell>
                {secondStageLock && 
                    <Table.HeaderCell>Electoral Threshold</Table.HeaderCell>
                }
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {tableRows}
        </Table.Body>
    </Table>
    )
}
export default ResultsTable