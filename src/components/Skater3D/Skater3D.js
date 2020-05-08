import React from 'react';
import * as THREE from 'three';

class Skater3D extends React.PureComponent {

  componentDidMount() {
    if (!this.props.scene) return;

    this.renderSkater();
  }

  componentWillUnmount() {
    if (this.skater && this.props.scene) {
      this.props.scene.remove(this.skater);
    }
    if (this.shadow && this.props.scene) {
      this.props.scene.remove(this.shadow);
    }
  }

  componentDidUpdate(prevProps) {
    let needsRender = false;
    if (this.props.x !== prevProps.x
      || this.props.y !== prevProps.y) {
        needsRender = true;

        this.skater.position.set(this.props.x, .85, this.props.y);
        this.shadow.position.x = this.props.x;
        this.shadow.position.z = this.props.y;
      }

    if (needsRender) this.props.onSkaterUpdated();
  }

  renderSkater() {
    let {
      team,
      x,
      y,
      // rotation,
      // idx,
      // label,
      // hasFocus,
      // isPivot,
      // isJammer,
    } = this.props;

    let geometry = new THREE.SphereGeometry( .3, 32, 32 );
    let material = new THREE.MeshPhongMaterial( {
      color: team === 'A' ? 0xff0000 : 0x008000,
      specular: 0x444444,
      shininess: 30,
    } );
    this.skater = new THREE.Mesh( geometry, material );
    this.skater.position.set(x, .85, y);
    this.props.scene.add( this.skater );


    // Skater Shadow

    geometry = new THREE.CircleGeometry( .3, 32 );
    material = new THREE.MeshBasicMaterial( { color: 0x222222, opacity: .2, transparent: true } );
    this.shadow = new THREE.Mesh( geometry, material );
    this.shadow.position.set(x, Math.random() * .00001, y);
    this.shadow.rotateX(-90 * Math.PI / 180);
    this.props.scene.add( this.shadow );
  }

  render() {
    return <></>
  }
}

export default Skater3D