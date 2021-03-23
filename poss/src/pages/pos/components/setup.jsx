import React, { useContext, useEffect, useState } from 'react';
import { Steps, Button, message, Dropdown, Menu, Row } from 'antd';
import Store from '../../../provider/store';
import axios from '../../../components/axios';
import { DownOutlined } from '@ant-design/icons';

const { Step } = Steps;

const SelectFloor = () => {
  const [FloorNumber, setFloorNumber] = useState('Floor');
  const StoreContext = useContext(Store);
  useEffect(() => {
    if (StoreContext.floor == null) {
      if (StoreContext.user.outlet !== null) {
        axios.get(`management/floor/outlet/${StoreContext.user.outlet.id}`).then(u => {
          StoreContext.setFloor(u.data);
        });
      } else {
        axios.get(`management/floor/restaurant/${StoreContext.user.restaurant.id}`).then(u => {
          StoreContext.setFloor(u.data);
        });
      }
    }
  }, []);
  return (
    <Dropdown
      overlay={
        StoreContext.floor == null ? (
          <Menu></Menu>
        ) : (
          <Menu
            onClick={e => {
              StoreContext.setSelectedFloor(e.key);
              setFloorNumber(StoreContext.floor.filter(a => a.id == e.key)[0].floorName);
              localStorage.setItem("floorId", e.key)
            }}
          >
            {StoreContext.floor.map(f => {
              return (
                <Menu.Item key={f.id}>
                  Floor Number
                  <b>{' ' + f.number}</b> {' ' + f.floorName}
                </Menu.Item>
              );
            })}
          </Menu>
        )
      }
    >
      <Button
        style={{
          width: '100%',
          marginTop: '40px',
          marginBottom: '20px',
        }}
      >
        {StoreContext.floor == null ? 'Fetching Floors...' : FloorNumber} <DownOutlined />
      </Button>
    </Dropdown>
  );
};

const SelectArea = () => {
  const [AreaNumber, setAreaNumber] = useState('Area');
  const StoreContext = useContext(Store);
  useEffect(() => {
    if (StoreContext.area == null && StoreContext.selectedFloor !== null) {
      axios.get(`/management/area/${StoreContext.selectedFloor}`).then(u => {
        StoreContext.setArea(u.data);
      });
    }
  }, []);

  return (
    <Dropdown
      disabled={StoreContext.selectedFloor == null}
      overlay={
        StoreContext.area == null ? (
          <Menu></Menu>
        ) : (
          <Menu
            onClick={e => {
              StoreContext.setSelectedArea(e.key);
              setAreaNumber(StoreContext.area.filter(a => a.id == e.key)[0].areaName);
              localStorage.setItem("areaId", e.key)
            }}
          >
            {StoreContext.area.map(f => {
              return <Menu.Item key={f.id}>{f.areaName}</Menu.Item>;
            })}
          </Menu>
        )
      }
    >
      <Button
        style={{
          width: '100%',
          marginTop: '40px',
          marginBottom: '20px',
        }}
      >
        {StoreContext.selectedFloor == null ? "Please Select Floor First" : StoreContext.area == null ? 'Fetching Areas...' : AreaNumber} <DownOutlined />
      </Button>
    </Dropdown>
  );
};

const SelectSection = () => {
  const [SectionNumber, setSectionNumber] = useState('Section');
  const StoreContext = useContext(Store);
  useEffect(() => {
    if (StoreContext.section == null && StoreContext.selectedArea !== null) {
      axios.get(`/management/section/${StoreContext.selectedArea}`).then(u => {
        StoreContext.setSection(u.data);
      });
    }
  }, []);

  return (
    <Dropdown
      disabled={StoreContext.selectedArea == null}
      overlay={
        StoreContext.section == null ? (
          <Menu></Menu>
        ) : (
          <Menu
            onClick={e => {
              StoreContext.setSelectedSection(e.key);
              setSectionNumber(StoreContext.section.filter(a => a.id == e.key)[0].sectionName);
              localStorage.setItem("sectionId", e.key)
            }}
          >
            {StoreContext.section.map(f => {
              return <Menu.Item key={f.id}>{f.sectionName}</Menu.Item>;
            })}
          </Menu>
        )
      }
    >
      <Button
        style={{
          width: '100%',
          marginTop: '40px',
          marginBottom: '20px',
        }}
      >
        {StoreContext.selectedFloor == null ? "Please Select Area First" : StoreContext.section == null ? 'Fetching Sections...' : SectionNumber} <DownOutlined />
      </Button>
    </Dropdown>
  );
};

const steps = [
  {
    title: 'Select Floor',
    content: <SelectFloor />,
  },
  {
    title: 'Select Area',
    content: <SelectArea />,
  },
  {
    title: 'Select Section',
    content: <SelectSection />,
  },
];

const Setup = (props) => {
  const [current, setCurrent] = React.useState(0);
  const StoreContext = useContext(Store)
  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  return (
    <>
      <Steps current={current}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div className="steps-content">{steps[current].content}</div>
      <Row justify="end">
        {current > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
            Previous
          </Button>
        )}
        {current < steps.length - 1 && (
          <Button type="primary" onClick={() => next()}>
            Next
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary"
          disabled={StoreContext.selectedSection == null}
          onClick={() => {
            message.success('Process complete!')
            props.finishSetup()
          }}>
            Done
          </Button>
        )}
      </Row>
    </>
  );
};

export default Setup;
