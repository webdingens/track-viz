import React from 'react';
import * as THREE from 'three';

class Track3DMarkings extends React.PureComponent {

  getFloor() {
    let geometry = new THREE.PlaneGeometry( 35, 25 );
    let material = new THREE.MeshBasicMaterial( { color: 0xdddddd, side: THREE.FrontSide } );
    let floor = new THREE.Mesh( geometry, material );
    floor.receiveShadow = true;

    return floor;
  }

  componentDidMount() {
    if (!this.props.scene) return;

    this.floor = this.getFloor();
    this.floor.rotateX(-Math.PI / 2);
    this.floor.position.y = -.003;

    this.props.scene.add(this.floor);
  }

  componentWillUnmount() {
    if (this.props.scene && this.floor)
      this.props.scene.remove(this.floor);
  }

  render() {
    return <></>;
  }
}




export default Track3DMarkings;