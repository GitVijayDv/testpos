import React, { Component, createRef } from 'react';
import {
  PageHeader,
  Tabs,
  Button,
  Statistic,
  Tag,
  Row,
  Col,
  Layout,
  Card,
  Avatar,
  Input,
  Modal,
  Menu,
  Empty,
  InputNumber,
  Typography,
  Space,
  Skeleton,
  Spin,
  List,
  Dropdown,
  message,
  Divider,
  Checkbox,
} from 'antd';
import { Offline, Online } from 'react-detect-offline';
import {
  BarcodeOutlined,
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  MinusOutlined,
  EditOutlined,
  CloseOutlined,
  CoffeeOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { Redirect } from 'umi';
import Setup from './components/setup';
import Store from '../../provider/store';
import axios from '../../components/axios';
import ReservationIndex from "./components/reservations";
const { TabPane } = Tabs;
const { Text } = Typography;
const { Content } = Layout;
const { Search } = Input;
const { Meta } = Card;

export default class POSIndex extends Component {
  static contextType = Store;
  constructor(props) {
    super(props);
    this.state = {
      needInits: false,
      addBalanceModal: false,
      hasAddOns: false,
      addOns: null,
      orders: [],
      orderforAPI: [],
      editingProduct: null,
      addOnProduct: null,
      currentAddOns: null,
      subtotal: 0,
      total: 0,
      discount: 0,
      tax: 0,
    };
    this.componentDidMount = () => {
      if (this.context.user !== null) {
        if (
          localStorage.getItem('floorId') == null ||
          localStorage.getItem('areaId') == null ||
          localStorage.getItem('sectionId') == null
        ) {
          this.setState({
            needInits: true,
          });
        }
      }
    };
  }
  calculateTax = total => {
    let p = parseFloat(this.state.tax) / 100;
    return p * total;
  };
  calculateDiscount = total => {
    let p = parseFloat(this.state.discount) / 100;
    return p * total;
  };
  calculateTotal = () => {
    var total = 0;
    this.state.orderforAPI.forEach(element => {
      var productTotal = 0;

      //calculate indivisual product cost according to quantity...
      let product = this.context.products.filter(a => a.id == element.product)[0];
      console.log(element.qty);
      productTotal += parseFloat(product.price) * element.qty;

      //adding addons price (if any)...
      if (element.addon !== null && element.addon !== undefined && element.addon.length !== 0) {
        element.addon.forEach(elementAddon => {
          productTotal += parseFloat(
            this.context.addOns.filter(a => a.name + " @ Rs." + a.price == elementAddon)[0].price,
          );
        });
      }

      //adding that indivisual calculate product to subtotal...
      total += productTotal;
    });

    this.setState({
      subtotal: total,
      total: total + this.calculateTax(total) - this.calculateDiscount(total),
    });
  };
  finishSetup = () => {
    this.setState({
      needInits: false,
    });
  };
  render() {
    return (
      //Main Root Div...
      this.context.user == null ? (
        <Redirect to="/" />
      ) : (
        <Store.Consumer>
          {context => {
            if (
              localStorage.getItem('floorId') !== null &&
              localStorage.getItem('areaId') !== null &&
              localStorage.getItem('sectionId') !== null
            ) {
              if (context.selectedFloor == null) {
                context.setSelectedFloor(localStorage.getItem('floorId'), false);
              }
              if (context.selectedArea == null) {
                context.setSelectedArea(localStorage.getItem('areaId'), false);
              }
              if (context.selectedSection == null) {
                context.setSelectedSection(localStorage.getItem('sectionId'), false);
              }
              if (context.productType == null) {
                if (localStorage.getItem('groupTypeAvailedIn') !== null) {
                  axios
                    .get(
                      `management/product.type/${localStorage.getItem(
                        'groupTypeAvailedIn',
                      )}/${localStorage.getItem(
                        localStorage.getItem('groupTypeAvailedIn') + 'Id',
                      )}`,
                    )
                    .then(u => {
                      context.setProductTypes(u.data.productTypes);
                    });
                } else {
                  this.setState({
                    needInits: true,
                  });
                }
              }
              if (context.products == null && context.productType !== null) {
                if (context.user.outlet !== null) {
                  axios
                    .post(`product/outlet`, {
                      outletId: context.user.outlet.id,
                      typeIds: context.productType.map(e => e.id),
                    })
                    .then(u => {
                      console.log(u.data);
                      context.setProducts(u.data);
                    });
                } else {
                  axios
                    .post(`product/restaurant`, {
                      restaurantId: context.user.restaurant.id,
                      typeIds: context.productType.map(e => e.id),
                    })
                    .then(u => {
                      context.setProducts(u.data);
                    });
                }
              }
            }
            return (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Modal
                  title="Add Balance"
                  visible={this.state.addBalanceModal}
                  onOk={this.handleOk}
                  onCancel={() => {
                    this.setState({
                      addBalanceModal: false,
                    });
                  }}
                >
                  <Input placeholder="Add Balance" />
                </Modal>
                <Modal
                  title="Let's Setup your POS"
                  visible={this.state.needInits}
                  width={'70vh'}
                  footer={null}
                  // onOk={this.handleOk}
                  // onCancel={this.handleCancel}
                >
                  <Setup finishSetup={this.finishSetup} />
                </Modal>
                <Modal
                  onCancel={() =>
                    this.setState({
                      hasAddOns: false,
                      addOns: null,
                    })
                  }
                  visible={this.state.hasAddOns}
                  title="Choose Add Ons"
                  onOk={e => {
                    this.setState(
                      {
                        orders: [
                          ...this.state.orders,
                          {
                            ...this.state.addOnProduct,
                            orderTotal: this.state.addOnProduct.price,
                            qty: 1,
                            orderType: '1',
                          },
                        ],
                        orderforAPI: [
                          ...this.state.orderforAPI,
                          {
                            product: this.state.addOnProduct.id,
                            addon: this.state.currentAddOns,
                            qty: 1,
                          },
                        ],
                        addOns: null,
                        addOnProduct: null,
                        hasAddOns: false,
                        currentAddOns: null,
                      },
                      () => {
                        this.calculateTotal();
                      },
                    );
                  }}
                >
                  <>
                    {this.state.addOns == null ? (
                      <Spin />
                    ) : (
                      <div>
                        <Checkbox.Group
                          onChange={e => {
                            var tempAddOnProduct = this.state.orderforAPI;
                            tempAddOnProduct.addOn = e;
                            this.setState({
                              currentAddOns: e,
                            });
                          }}
                          options={this.state.addOns.map(addon => addon.name + " @ Rs." + addon.price)}
                        />
                      </div>
                    )}
                  </>
                </Modal>
                <Modal
                  title="Edit Order"
                  visible={this.state.editingProduct !== null}
                  onOk={() => {
                    var tempAPIOrders = this.state.orderforAPI;
                    tempAPIOrders.find(
                      a => a.product == this.state.editingProduct.id,
                    ).addon = this.state.currentAddOns;
                    this.setState(
                      {
                        orderforAPI: tempAPIOrders,
                        editingProduct: null,
                        addOns: null,
                        currentAddOns: null,
                      },
                      () => {
                        this.calculateTotal();
                      },
                    );
                  }}
                  onCancel={() => {
                    this.setState(
                      {
                        editingProduct: null,
                        addOns: null,
                        currentAddOns: null,
                      },
                      () => {
                        this.calculateTotal();
                      },
                    );
                  }}
                >
                  <Divider orientation="left">Add Ons</Divider>
                  {this.state.editingProduct !== null &&
                  this.state.editingProduct.productAddOns.length !== 0 ? (
                    <>
                      {this.state.addOns == null ? (
                        <Spin />
                      ) : (
                        <div>
                          <Checkbox.Group
                            value={this.state.currentAddOns}
                            onChange={e => {
                              this.setState({
                                currentAddOns: e,
                              });
                            }}
                            options={this.state.addOns.map(addon => addon.name + " @ Rs." + addon.price)}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Text type="secondary">There're No Addons For This Product</Text>
                    </>
                  )}
                  <Divider orientation="left">Remarks</Divider>
                  <Input.TextArea
                    value={
                      this.state.editingProduct == null ? '' : this.state.editingProduct.remarks
                    }
                    placeholder="Please provide remarks (if any)"
                    onChange={e => {
                      var tempAPIOrders = this.state.orderforAPI;
                      tempAPIOrders.find(a => a.product == this.state.editingProduct.id).remarks =
                        e.target.value;

                      var tempEditingOrder = this.state.editingProduct;
                      tempEditingOrder.remarks = e.target.value;
                      this.setState({
                        orderforAPI: tempAPIOrders,
                        editingProduct: tempEditingOrder,
                      });
                    }}
                  />
                </Modal>
                {/* Page Header... */}
                <PageHeader
                  className="site-page-header-responsive"
                  onBack={() => window.history.back()}
                  title={context.user.restaurant.restuarantName}
                  subTitle={
                    context.user.outlet == null
                      ? context.user.restaurant.addressLineOne.join(' / ')
                      : context.user.outlet.addressLineOne.join(' / ')
                  }
                  tags={
                    <div>
                      <Online>
                        <Tag color="green">Online</Tag>
                      </Online>
                      <Offline>
                        <Tag color="volcano">Offline</Tag>
                      </Offline>
                    </div>
                  }
                  extra={[
                    <Button key="3">Change Location</Button>,
                    <Button key="2" onClick={() => this.setState({ addBalanceModal: true })}>
                      Add Balance <PlusOutlined />
                    </Button>,
                    <Avatar
                      style={{ backgroundColor: '#87d068', marginLeft: '14px' }}
                      icon={<UserOutlined />}
                    />,
                  ]}
                />
                {/* Main Content... */}
                <Content
                  style={{
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    marginBottom: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Tabs
                    defaultActiveKey="1"
                    size="large"
                    type="card"
                    tabBarGutter={8}
                    tabBarStyle={{
                      marginBottom: '0px',
                    }}
                    tabBarExtraContent={
                      <div>
                        <CalendarOutlined
                          style={{
                            marginRight: '8px',
                          }}
                        />
                        {new Date().toDateString()}
                      </div>
                    }
                  >
                    <TabPane tab="Restaurant Sales" key="1">
                      <Content>
                        <Row>
                          {/* this is product types tabs.... */}
                          <Col span={14}>
                            {context.productType == null ? (
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <Space
                                    style={{
                                      marginTop: '24px',
                                    }}
                                  >
                                    <Skeleton.Button
                                      active={true}
                                      size={'large'}
                                      shape={'square'}
                                    />
                                    <Skeleton.Button
                                      active={true}
                                      size={'large'}
                                      shape={'square'}
                                    />
                                    <Skeleton.Button
                                      active={true}
                                      size={'large'}
                                      shape={'square'}
                                    />
                                  </Space>
                                  <Space
                                    style={{
                                      marginTop: '24px',
                                    }}
                                  >
                                    <Skeleton.Button
                                      active={true}
                                      size={'large'}
                                      shape={'square'}
                                    />
                                    <Skeleton.Input
                                      style={{ width: 200 }}
                                      active={true}
                                      size={'large'}
                                    />
                                  </Space>
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Spin
                                    size={'large'}
                                    tip="Loading Product Types..."
                                    style={{
                                      paddingTop: '104px',
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <Tabs
                                tabBarExtraContent={
                                  <div
                                    style={{
                                      display: 'flex',
                                    }}
                                  >
                                    <Button size="large" style={{ marginRight: '8px' }}>
                                      Add Types <PlusOutlined />
                                    </Button>
                                    <Search
                                      prefix={<BarcodeOutlined />}
                                      placeholder="Search Product"
                                      allowClear
                                      enterButton="Search"
                                      size="large"
                                    />
                                  </div>
                                }
                                style={{
                                  marginTop: '8px',
                                }}
                                tabBarGutter={36}
                                size="large"
                                onChange={e => {
                                  context.changeFilteredProducts(e);
                                }}
                              >
                                {context.productType.map(type => (
                                  <TabPane tab={type.name} key={type.id}>
                                    {context.products == null ? (
                                      <div
                                        style={{
                                          display: 'flex',
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                        }}
                                      >
                                        <Spin
                                          size={'large'}
                                          tip="Loading Products..."
                                          style={{
                                            paddingTop: '104px',
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <Row gutter={[8, 8]}>
                                        {context.filteredProducts.map(product => (
                                          <Col className="gutter-row" span={6}>
                                            <Card
                                              onClick={() => {
                                                if (product.productAddOns.length > 0) {
                                                  if (
                                                    !this.state.orders.some(
                                                      order => order.id === product.id,
                                                    )
                                                  ) {
                                                    //start/show loading of addon modal...
                                                    this.setState({
                                                      hasAddOns: true,
                                                    });

                                                    //check which addons are not available in context...
                                                    var notAvailable = [];
                                                    product.productAddOns.forEach(addon => {
                                                      if (
                                                        context.addOns.filter(a => a.id == addon)
                                                          .length == 0
                                                      ) {
                                                        notAvailable.push(addon);
                                                      }
                                                    });
                                                    //get the non available addons from server...
                                                    console.log(notAvailable);
                                                    if (notAvailable.length > 0) {
                                                      axios
                                                        .post('productAdOn', {
                                                          addOnIds: notAvailable,
                                                        })
                                                        .then(u => {
                                                          context.setAddons(u.data);
                                                          this.setState({
                                                            //setting both already available addons and addons which just received from api/server to state...
                                                            addOns: [
                                                              ...u.data,
                                                              ...context.addOns.filter(
                                                                addOn =>
                                                                  product.productAddOns.indexOf(
                                                                    addOn.id,
                                                                  ) > -1,
                                                              ),
                                                            ],
                                                            addOnProduct: product,
                                                          });
                                                        });
                                                    } else {
                                                      this.setState({
                                                        //setting already available addons to state...
                                                        addOns: context.addOns.filter(
                                                          addOn =>
                                                            product.productAddOns.indexOf(
                                                              addOn.id,
                                                            ) > -1,
                                                        ),
                                                        addOnProduct: product,
                                                      });
                                                    }
                                                  } else {
                                                    message.open({
                                                      content: 'Already Added To Cart',
                                                    });
                                                  }
                                                } else {
                                                  if (this.state.orders.length !== 0) {
                                                    if (
                                                      !this.state.orders.some(
                                                        order => order.id === product.id,
                                                      )
                                                    ) {
                                                      this.setState(
                                                        {
                                                          orders: [
                                                            ...this.state.orders,
                                                            {
                                                              ...product,
                                                              qty: 1,
                                                              orderTotal: product.price,
                                                              orderType: '1',
                                                            },
                                                          ],
                                                          orderforAPI: [
                                                            ...this.state.orderforAPI,
                                                            {
                                                              product: product.id,
                                                              qty: 1,
                                                            },
                                                          ],
                                                        },
                                                        () => {
                                                          this.calculateTotal();
                                                        },
                                                      );
                                                    } else {
                                                      message.open({
                                                        content: 'Already Added To Cart',
                                                      });
                                                    }
                                                  } else {
                                                    this.setState(
                                                      {
                                                        orders: [
                                                          ...this.state.orders,
                                                          {
                                                            ...product,
                                                            qty: 1,
                                                            orderTotal: product.price,
                                                            orderType: '1',
                                                          },
                                                        ],
                                                        orderforAPI: [
                                                          ...this.state.orderforAPI,
                                                          {
                                                            product: product.id,
                                                            qty: 1,
                                                          },
                                                        ],
                                                      },
                                                      () => {
                                                        this.calculateTotal();
                                                      },
                                                    );
                                                  }
                                                }
                                              }}
                                              style={{
                                                cursor: 'pointer',
                                              }}
                                              key={product.id}
                                              cover={
                                                <img
                                                  alt={product.name}
                                                  src={product.image}
                                                  width={240}
                                                  height={240}
                                                />
                                              }
                                            >
                                              <Meta
                                                title={product.name}
                                                description={
                                                  <div
                                                    style={{
                                                      color: 'black',
                                                    }}
                                                  >
                                                    <div
                                                      style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                      }}
                                                    >
                                                      <div>
                                                        <b>Rs.{product.price}</b> +{' '}
                                                        {product.tax || '0' + '% Tax'}
                                                      </div>
                                                      <Tag
                                                        color={
                                                          product.productCategory == 'Vegetarian'
                                                            ? 'green'
                                                            : product.productCategory ==
                                                              'Non-Vegetarian'
                                                            ? 'red'
                                                            : product.productCategory.alias ==
                                                              'Eggetarian'
                                                            ? 'yellow'
                                                            : 'default'
                                                        }
                                                      >
                                                        {product.productCategory == 'Vegetarian'
                                                          ? 'Veg'
                                                          : product.productCategory ==
                                                            'Non-Vegetarian'
                                                          ? 'Non-Veg'
                                                          : product.productCategory == 'Eggetarian'
                                                          ? 'Egg'
                                                          : 'N/A'}
                                                      </Tag>
                                                    </div>
                                                    <div style={{ marginTop: '4px' }}>
                                                      <Tag color="blue">{product.productSize}</Tag>
                                                      <Tag color="geekblue">
                                                        {product.productGroup}
                                                      </Tag>
                                                    </div>
                                                  </div>
                                                }
                                              />
                                            </Card>
                                          </Col>
                                        ))}
                                      </Row>
                                    )}
                                  </TabPane>
                                ))}
                              </Tabs>
                            )}
                          </Col>
                          {/* this is order receipt  */}
                          <Col span={10}>
                            <Card
                              title="Order Receipt"
                              type="inner"
                              style={{
                                margin: '18px',
                              }}
                              extra={
                                <div>
                                  <Button style={{ color: '#f39c12', borderColor: '#f39c12' }}>
                                    Hold
                                  </Button>
                                  <Button danger style={{ marginLeft: '4px' }}>
                                    Cancel
                                  </Button>
                                </div>
                              }
                              actions={[
                                <Col>
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Text type="secondary" style={{ marginLeft: '18px' }}>
                                      Discount (%)
                                    </Text>
                                    <InputNumber
                                      value={this.state.discount}
                                      onChange={e => {
                                        this.setState({
                                          discount: e
                                        }, () => {
                                          this.calculateTotal()
                                        })
                                      }}
                                      style={{
                                        marginRight: '18px',
                                      }}
                                      min={0}
                                      max={100}
                                      formatter={value => `${value}%`}
                                      parser={value => value.replace('%', '')}
                                    />
                                  </div>
                                  <div
                                    style={{
                                      marginTop: '8px',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Text type="secondary" style={{ marginLeft: '18px' }}>
                                      Tax (%)
                                    </Text>
                                    <InputNumber
                                      value={this.state.tax}
                                      onChange={e => {
                                        this.setState({
                                          tax: e
                                        }, () => {
                                          this.calculateTotal()
                                        })
                                      }}
                                      style={{
                                        marginRight: '18px',
                                      }}
                                      min={0}
                                      max={100}
                                      formatter={value => `${value}%`}
                                      parser={value => value.replace('%', '')}
                                    />
                                  </div>
                                  <div
                                    style={{
                                      marginTop: '8px',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Text type="secondary" style={{ marginLeft: '18px' }}>
                                      Sub Total
                                    </Text>
                                    <Text style={{ marginTop: '8px', marginRight: '18px' }}>
                                      {this.state.subtotal}
                                    </Text>
                                  </div>
                                  <div
                                    style={{
                                      marginTop: '8px',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Text type="secondary" style={{ marginLeft: '18px' }}>
                                      Total
                                    </Text>
                                    <Statistic
                                      style={{
                                        marginRight: '18px',
                                      }}
                                      value={this.state.total}
                                      precision={2}
                                    />
                                  </div>
                                  <div
                                    style={{
                                      marginTop: '8px',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Button
                                      size="large"
                                      style={{
                                        backgroundColor: '#2ecc71',
                                        color: 'white',
                                        width: '100%',
                                        marginLeft: '18px',
                                        marginRight: '18px',
                                        borderColor: '#2ecc71',
                                      }}
                                    >
                                      Pay
                                    </Button>
                                  </div>
                                </Col>,
                              ]}
                            >
                              {this.state.orders.length == 0 ? (
                                <Empty
                                  description="No Products Added"
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                  }}
                                />
                              ) : (
                                <List
                                  itemLayout="vertical"
                                  size="large"
                                  dataSource={this.state.orders}
                                  renderItem={order => (
                                    <List.Item
                                      key={order.id}
                                      extra={
                                        <Col>
                                          <img
                                            width={85}
                                            alt="logo"
                                            src={order.image}
                                            style={{
                                              borderRadius: '12px',
                                            }}
                                          />
                                          <Row justify="center" style={{ marginTop: '12px' }}>
                                            <Button
                                              style={{ marginRight: '18px' }}
                                              type="primary"
                                              shape="circle"
                                              icon={<CloseOutlined />}
                                              onClick={() => {
                                                this.setState({
                                                  orders: this.state.orders.filter(
                                                    o => o.id !== order.id,
                                                  ),
                                                  orderforAPI: this.state.orderforAPI.filter(
                                                    o => o.product !== order.id,
                                                  ),
                                                });
                                              }}
                                              size={'large'}
                                              danger
                                            />
                                            <Button
                                              type="primary"
                                              shape="circle"
                                              icon={<EditOutlined />}
                                              onClick={() => {
                                                this.setState({
                                                  editingProduct: order,
                                                  currentAddOns: this.state.orderforAPI.filter(
                                                    a => a.product == order.id,
                                                  )[0].addon,
                                                });
                                                if (order.productAddOns.length > 0) {
                                                  const addOns = context.addOns.filter(
                                                    addOn =>
                                                      order.productAddOns.indexOf(addOn.id) > -1,
                                                  );
                                                  if (addOns.length > 0) {
                                                    this.setState({
                                                      addOns: addOns,
                                                    });
                                                  } else {
                                                    axios
                                                      .post('productAdOn', {
                                                        addOnIds: order.productAddOns,
                                                      })
                                                      .then(u => {
                                                        context.setAddons(u.data);
                                                        this.setState({
                                                          addOns: u.data,
                                                        });
                                                      });
                                                  }
                                                }
                                                this.setState({});
                                              }}
                                              size={'large'}
                                            />
                                          </Row>
                                        </Col>
                                      }
                                    >
                                      <Row style={{ marginBottom: '6px' }}>
                                        <Col
                                          span={20}
                                          style={{
                                            textAlign: 'left',
                                            fontSize: '1rem',
                                          }}
                                        >
                                          {order.name}{' '}
                                          <Tag color="blue" style={{ marginLeft: '8px' }}>
                                            {order.productSize}
                                          </Tag>
                                          <Tag
                                            color={
                                              order.productCategory == 'Vegetarian'
                                                ? 'green'
                                                : order.productCategory == 'Non-Vegetarian'
                                                ? 'red'
                                                : order.productCategory.alias == 'Eggetarian'
                                                ? 'yellow'
                                                : 'default'
                                            }
                                          >
                                            {order.productCategory == 'Vegetarian'
                                              ? 'Veg'
                                              : order.productCategory == 'Non-Vegetarian'
                                              ? 'Non-Veg'
                                              : order.productCategory == 'Eggetarian'
                                              ? 'Egg'
                                              : 'N/A'}
                                          </Tag>
                                        </Col>
                                        <Col
                                          span={4}
                                          style={{
                                            textAlign: 'right',
                                          }}
                                        >
                                          <b>Rs.{order.orderTotal}</b>
                                        </Col>
                                      </Row>
                                      <Row style={{ marginBottom: '4px' }}>
                                        <Col span={12}>
                                          <Text type="secondary">Choose Order Type</Text>
                                          <Dropdown
                                            overlay={
                                              <Menu
                                                onClick={e => {
                                                  var tempOrders = this.state.orders;
                                                  tempOrders.find(
                                                    tempOrder => tempOrder.id == order.id,
                                                  ).orderType = e.key;
                                                  this.setState({
                                                    orders: tempOrders,
                                                  });
                                                }}
                                              >
                                                <Menu.Item key="1" icon={<CoffeeOutlined />}>
                                                  Dine In
                                                </Menu.Item>
                                                <Menu.Item key="2" icon={<ShoppingOutlined />}>
                                                  Take Away
                                                </Menu.Item>
                                              </Menu>
                                            }
                                          >
                                            <Button style={{ width: '100%' }}>
                                              {order.orderType == '1' ? 'Dine In' : 'Take Away'}{' '}
                                              {order.orderType == '1' ? (
                                                <CoffeeOutlined />
                                              ) : (
                                                <ShoppingOutlined />
                                              )}
                                            </Button>
                                          </Dropdown>
                                        </Col>
                                        <Col span={12}>
                                          <div style={{ color: 'transparent' }}>X</div>
                                          <Row gutter={12} justify="end">
                                            <Button
                                              type="primary"
                                              icon={<MinusOutlined />}
                                              size={'middle'}
                                              ghost
                                              onClick={() => {
                                                var tempOrders = this.state.orders;
                                                var tempAPIOrder = this.state.orderforAPI;
                                                if (
                                                  tempOrders.find(
                                                    tempOrder => tempOrder.id == order.id,
                                                  ).qty > 1
                                                ) {
                                                  //modifying order...
                                                  tempOrders.find(
                                                    tempOrder => tempOrder.id == order.id,
                                                  ).qty -= 1;

                                                  tempOrders.find(
                                                    tempOrder => tempOrder.id == order.id,
                                                  ).orderTotal =
                                                    tempOrders.find(
                                                      tempOrder => tempOrder.id == order.id,
                                                    ).price *
                                                    tempOrders.find(
                                                      tempOrder => tempOrder.id == order.id,
                                                    ).qty;

                                                  //modifying orderAPI...
                                                  tempAPIOrder.find(
                                                    o => o.product == order.id,
                                                  ).qty -= 1;
                                                  this.setState(
                                                    {
                                                      orders: tempOrders,
                                                      orderforAPI: tempAPIOrder,
                                                    },
                                                    () => {
                                                      this.calculateTotal();
                                                    },
                                                  );
                                                }
                                              }}
                                            />
                                            <Input
                                              value={order.qty}
                                              style={{
                                                width: '35%',
                                                marginRight: '4px',
                                                marginLeft: '4px',
                                              }}
                                            />
                                            <Button
                                              type="primary"
                                              icon={<PlusOutlined />}
                                              size={'middle'}
                                              ghost
                                              onClick={() => {
                                                var tempAPIOrder = this.state.orderforAPI;
                                                var tempOrders = this.state.orders;
                                                tempOrders.find(
                                                  tempOrder => tempOrder.id == order.id,
                                                ).qty += 1;

                                                tempOrders.find(
                                                  tempOrder => tempOrder.id == order.id,
                                                ).orderTotal =
                                                  tempOrders.find(
                                                    tempOrder => tempOrder.id == order.id,
                                                  ).price *
                                                  tempOrders.find(
                                                    tempOrder => tempOrder.id == order.id,
                                                  ).qty;
                                                //modifying orderAPI...
                                                tempAPIOrder.find(
                                                  o => o.product == order.id,
                                                ).qty += 1;
                                                this.setState(
                                                  {
                                                    orders: tempOrders,
                                                    orderforAPI: tempAPIOrder,
                                                  },
                                                  () => {
                                                    this.calculateTotal();
                                                  },
                                                );
                                              }}
                                            />
                                          </Row>
                                        </Col>
                                      </Row>
                                      <Row>
                                        <Col span={24}>
                                          <Text type="secondary">Extras</Text>
                                          <Row>
                                            {this.state.orderforAPI.filter(
                                              a => a.product == order.id,
                                            )[0].addon !== undefined &&
                                            this.state.orderforAPI.filter(
                                              a => a.product == order.id,
                                            )[0].addon !== null &&
                                            this.state.orderforAPI.filter(
                                              a => a.product == order.id,
                                            )[0].addon.length !== 0 ? (
                                              this.state.orderforAPI
                                                .filter(a => a.product == order.id)[0]
                                                .addon.map(b => <Tag color="#87d068">{b}</Tag>)
                                            ) : (
                                              <Tag
                                                style={{
                                                  background: '#fff',
                                                  borderStyle: 'dashed',
                                                }}
                                              >
                                                No Extras Added
                                              </Tag>
                                            )}
                                          </Row>
                                        </Col>
                                      </Row>
                                    </List.Item>
                                  )}
                                />
                              )}
                            </Card>
                          </Col>
                        </Row>
                      </Content>
                    </TabPane>
                    <TabPane tab="Online Orders" key="2"></TabPane>
                    <TabPane tab="Reservations" key="3">
                      <ReservationIndex />
                    </TabPane>
                  </Tabs>
                </Content>
              </div>
            );
          }}
        </Store.Consumer>
      )
    );
  }
}
