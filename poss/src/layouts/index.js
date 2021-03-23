import React, { Component } from 'react';
import axios from '../components/axios';
import Store from '../provider/store';

export default class BasicLayout extends Component {
  state = {
    user: null,
    floor: null,
    selectedFloor: null,
    area: null,
    selectedArea: null,
    section: null,
    selectedSection: null,
    productType: null,
    products: null,
    filteredProducts: null,
    addOns: [],
  };
  setUser = user => {
    this.setState({
      user: user,
    });
  };
  setFloor = floor => {
    this.setState({
      floor: floor,
    });
  };
  setSelectedFloor = (id, fetchProductTypes = true) => {
    this.setState(
      {
        selectedFloor: id,
      },
      () => {
        if (fetchProductTypes) {
          this.getProductTypesByFloor();
        }
      },
    );
  };
  setArea = area => {
    this.setState({
      area: area,
    });
  };
  setSelectedArea = (area, fetchProductTypes = true) => {
    this.setState(
      {
        selectedArea: area,
      },
      () => {
        if (fetchProductTypes) {
          this.getProductTypesByArea();
        }
      },
    );
  };
  setSelectedSection = (section, fetchProductTypes = true) => {
    this.setState(
      {
        selectedSection: section,
      },
      () => {
        if (fetchProductTypes) {
          this.getProductTypesBySection();
        }
      },
    );
  };
  setSection = section => {
    this.setState({
      section: section,
    });
  };
  getProductTypesByFloor = () => {
    axios.get(`management/product.type/floor/${this.state.selectedFloor}`).then(u => {
      console.log(u);
      if (u.data.productTypes.length > 0) {
        localStorage.setItem('groupTypeAvailedIn', 'floor');
        this.setState({
          productType: u.data.productTypes,
        });
      }
    });
  };
  getProductTypesByArea = () => {
    axios.get(`management/product.type/area/${this.state.selectedArea}`).then(u => {
      localStorage.setItem('groupTypeAvailedIn', 'area');
      if (u.data.productTypes.length > 0) {
        this.setState({
          productType: u.data.productTypes,
        });
      }
    });
  };
  getProductTypesBySection = () => {
    axios.get(`management/product.type/section/${this.state.selectedSection}`).then(u => {
      localStorage.setItem('groupTypeAvailedIn', 'section');
      if (u.data.productTypes.length > 0) {
        this.setState({
          productType: u.data.productTypes,
        });
      }
    });
  };
  setProductTypes = types => {
    this.setState({
      productType: types,
    });
  };
  setProducts = products => {
    this.setState({
      products: products,
      filteredProducts: products.filter(
        product => product.productTypeId == this.state.productType[0].id,
      ),
    });
  };
  changeFilteredProducts = id => {
    this.setState({
      filteredProducts: this.state.products.filter(product => product.productTypeId == id),
    });
  };
  setAddons = addons => {
    this.setState({
      addOns: [...this.state.addOns, ...addons],
    });
  };
  render() {
    return (
      <Store.Provider
        value={{
          ...this.state,
          setUser: this.setUser,
          setFloor: this.setFloor,
          setArea: this.setArea,
          setSection: this.setSection,
          setSelectedFloor: this.setSelectedFloor,
          setSelectedArea: this.setSelectedArea,
          setSelectedSection: this.setSelectedSection,
          getProductTypesByArea: this.getProductTypesByArea,
          getProductTypesByFloor: this.getProductTypesByFloor,
          getProductTypesBySection: this.getProductTypesBySection,
          setProductTypes: this.setProductTypes,
          setProducts: this.setProducts,
          changeFilteredProducts: this.changeFilteredProducts,
          setAddons: this.setAddons,
        }}
      >
        {this.props.children}
      </Store.Provider>
    );
  }
}
