import React, { Component } from 'react'
import { Table, Tag, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
];


export default class ReservationIndex extends Component {
    render() {
        return (
            <div>
                <Button
                    type="primary"
                    style={{
                        marginTop: "42px",
                        marginBottom: "12px"
                    }}
                ><PlusOutlined /> Create Reservation</Button>
                <Table columns={columns} dataSource={[]} />
            </div>
        )
    }
}
