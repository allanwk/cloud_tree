import React, { Component } from "react";
import { Person, Partnership } from '../tree_scripts/tree_utils';
import { attachContextMenu } from './ContextMenu';
import Modal from 'react-modal';
import './style.css';
import { connect } from 'react-redux';
import Connections from './Connections';

Modal.setAppElement('#app')

class Tree extends Component{
    constructor(props){
        super(props);
        this.state = {
            modalIsOpen: false,
            createPersonType: null,
            createPersonName: "",
            selectedPerson: null,
            shouldUpdate: true,
            modalMode: null,
            focus_rel: null,
            max_x: null,
            max_y: null
        }

        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.createPerson = this.createPerson.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.deletePerson = this.deletePerson.bind(this);
        this.editPerson = this.editPerson.bind(this);
        this.changeFocus = this.changeFocus.bind(this);

        this.people = {};
        this.relationships = {};
        this.displayed_rels = [];
        this.spacing = 20;
        this.person_width = 100;
        this.level_height = 100;
        this.yoffset = 100;
    }

    calculate_positions(){
        var max_x = 0;
        var max_y = 0;
        Object.values(this.relationships).forEach((rel, j) => {
            var y = this.convert_y(rel.y);
            rel.partners.forEach((partner, i) => {
                var x = rel.x * 2;
                if (i == 0 && rel.partners.length == 1)
                    x += 0.5;
                else if(i == 1)
                    x += 1;
                x = this.convert_x(x);
                partner.x = x;
                partner.y = y;
                if (x > max_x){
                    max_x = x;
                }
                if (y > max_y){
                    max_y = y;
                }
            })
        })
        this.setState({
            ...this.state,
            max_x: max_x,
            max_y: max_y
        })
    }

    convert_x(x){
        return x * (this.person_width + this.spacing)
    }

    convert_y(y){
        return this.yoffset + y * (this.level_height + this.spacing)
    }

    openModal(el, personType, modalMode = "CREATE") {
        var selectedPerson = this.people[el.getAttribute('id')]
        this.setState({
            ...this.state,
            modalIsOpen: true,
            createPersonType: personType,
            selectedPerson: selectedPerson,
            modalMode: modalMode
        })
    }
    
    afterOpenModal() {

    }
    
    closeModal() {
        this.setState({
            ...this.state,
            modalIsOpen: false
        })
    }

    handleChange = (e) => {
        this.setState({
            ...this.state,
            createPersonName: e.target.value
        })
    }

    deletePerson(el){
        var person = this.people[el.getAttribute('id')]
        if (person.partnership.children.length == 0 || person.parent_relationship == null){
            var deletePersonRequest = {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: person.id
                })
            }
            fetch('/api/person', deletePersonRequest)
            .then((response) => response.json())
            .then((data) => {
                if(person.partnership.partners.length < 2){
                    var deleteRelRequest = {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: person.partnership.id
                        })
                    }
                    fetch('/api/partnership', deleteRelRequest)
                    .then((response) => (response.json()))
                    .then((data) => {
                        this.closeModal();
                        this.getTreeInfo()
                    })
                } else {
                    this.getTreeInfo();
                }
            })
        } else {
            alert("Não é possível excluir uma pessoa no interior da árvore");
        }
    }

    changeFocus(el){
        var person = this.people[el.getAttribute('id')]
        this.setState({
            ...this.state,
            focus_rel: person.partnership.id
        })
        this.getTreeInfo();
    }

    editPerson(){
        var person = this.state.selectedPerson;
        const editPersonRequest = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user: this.props.username,
                name: this.state.createPersonName,
                id: person.id
            }),
        };
        fetch('/api/person', editPersonRequest)
        .then((response) => (response.json()))
        .then((data) => {
            this.closeModal();
            this.getTreeInfo()
        })
    }

    createPerson(){
        var person = this.state.selectedPerson;
        const newPersonRequest = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user: this.props.username,
                name: this.state.createPersonName
            }),
        };
        switch(this.state.createPersonType){
            case 'pai/mãe':
                if (person.parent_relationship != null){
                    if (person.parent_relationship.partners.length == 2){
                        alert("Não é possível cadastrar mais de dois pais");
                        this.closeModal();
                        return;
                    }
                }
                var isPartner1 = person == person.partnership.partners[0];
                if (person.parent_relationship == null){
                    fetch('/api/person', newPersonRequest)
                    .then((response) => (response.json()))
                    .then((data) => fetch('api/partnership', {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({                              
                            user: this.props.username,
                            partner1: data.id
                        }),
                    }))
                    .then((response) => (response.json()))
                    .then((data) => {
                        var request;
                        if (isPartner1){
                            request = {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({                              
                                    user: this.props.username,
                                    id: person.partnership.id,
                                    partner1_parent: data.id
                                }),
                            };
                        } else {
                            request = {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({                              
                                    user: this.props.username,
                                    id: person.partnership.id,
                                    partner2_parent: data.id
                                }),
                            };
                        }
                        fetch('/api/partnership', request)
                        .then((response) => (response.json()))
                        .then((data) => {
                            this.closeModal();
                            this.getTreeInfo()
                        })
                    })
                } else {
                    fetch('/api/person', newPersonRequest)
                    .then((response) => (response.json()))
                    .then((data) => fetch('api/partnership', {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            user: this.props.username,
                            partner2: data.id,
                            id: person.parent_relationship.id
                        }),
                    }))
                    .then((response) => (response.json()))
                    .then((data) => {
                        this.closeModal();
                        this.getTreeInfo()
                    })
                }
                break;
            case 'filho':
                fetch('/api/person', newPersonRequest)
                .then((response) => (response.json()))
                .then((data) => fetch('api/partnership', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({                              
                        user: this.props.username,
                        partner1: data.id,
                        partner1_parent: person.partnership.id
                    }),
                }))
                .then((response) => (response.json()))
                .then((data) => {
                    this.closeModal();
                    this.getTreeInfo()
                })
                break;

            case 'cônjuge':
                if (person.partnership.partners.length < 2){
                    fetch('/api/person', newPersonRequest)
                    .then((response) => (response.json()))
                    .then((data) => fetch('api/partnership', {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({                              
                            user: this.props.username,
                            id: person.partnership.id,
                            partner2: data.id
                        }),
                    }))
                    .then((response) => (response.json()))
                    .then((data) => {
                        this.closeModal();
                        this.getTreeInfo()
                    })
                } else {
                    alert("Não é possível cadastrar mais de dois cônjuges por relacionamento")
                    this.closeModal();
                }
                break
        }
    }

    componentDidUpdate(props, state){
        if(this.props.token != null && this.state.shouldUpdate){
            this.getTreeInfo()
        }
    }

    getTreeInfo(){
        fetch('/api/list?code=' + this.props.username + "&focus=" + this.state.focus_rel).then((response) => response.json()).then((data) => {
            for(var i = 0; i < data.people.length; i++){
                var p = new Person(data.people[i].name, data.people[i].id);
                this.people[data.people[i].id] = p;
            }
            for(var i = 0; i < data.partnerships.length; i++){
                var p1 = this.people[data.partnerships[i].partner1];
                var p2 = this.people[data.partnerships[i].partner2];
                p = new Partnership([p1, p2]);
                p.id = data.partnerships[i].id;
                p.x = data.partnerships[i].x;
                p.y = data.partnerships[i].y;
                this.relationships[data.partnerships[i].id] = p;
            }
            for(var i = 0; i < data.partnerships.length; i++){
                var partnership = this.relationships[data.partnerships[i].id];
                var parent1 = this.relationships[data.partnerships[i].partner1_parent];
                var parent2 = this.relationships[data.partnerships[i].partner2_parent];
                if (typeof parent1 !== 'undefined') {
                    parent1.add_children([partnership.partners[0]]);
                }
                if (typeof parent2 !== 'undefined') {
                    parent2.add_children(partnership.partners[1]);
                }
            }
           this.calculate_positions();
           this.setState({
              ...this.state,
              shouldUpdate: false
           })
           this.add_context_menus();
        })
    }

    render(){
        if(this.props.username == ''){
            location.href = '/login'
        }

        var w = (this.person_width).toString() + 'px'
        var p = Object.values(this.people);
        var people = p.map(function(person){
            if(!Number.isNaN(person.x)){
                return (<div className="person" id={person.id} key={person.id} style={{'left': person.x, 'top':person.y, 'width': w, 'height': w}}>
                        {person.name}
                    </div>)
            } else {
                return null;
            }
        });
            
        var modal_title = '';
        if (this.state.selectedPerson !== null){
            modal_title = "Adicionar " + this.state.createPersonType + " de " + this.state.selectedPerson.name
        }
        if(this.props.token !== null && people.length == 0){
            this.getTreeInfo()
        }
        return (
            <div className="tree-div">
                { people }
                <Connections people={p} person_width={this.person_width}
                level_height={this.level_height} yoffset={this.yoffset}
                spacing= {this.spacing} max_x={this.state.max_x} max_y={this.state.max_y}/>
                <Modal
                isOpen={this.state.modalIsOpen}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                contentLabel="Example Modal"
                >
                    <h4>{ modal_title }</h4>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <input onChange={this.handleChange}/>
                        {this.state.modalMode == 'CREATE' ? 
                            <button type="submit" onClick={this.createPerson}>Criar</button>
                            :
                            <button type="submit" onClick={this.editPerson}>Confirmar</button>
                        }
                        <button onClick={this.closeModal}>Cancelar</button>
                    </form>
                </Modal>
            </div>
        );
    }
    
    add_context_menus(){
        document.querySelectorAll('div.person')
        .forEach(person => {
            attachContextMenu(person, this, [
            {label: "Focar nesta pessoa", action(el, component=this) {component.changeFocus(el)}},
            {label: "Adicionar pai/mãe", action(el, component=this) {component.openModal(el, 'pai/mãe')}},
            {label: "Adicionar filho", action(el, component=this) {component.openModal(el, 'filho')}},
            {label: "Adicionar cônjuge", action(el, component=this) {component.openModal(el, 'cônjuge')}},
            {label: "Editar pessoa", action(el, component=this) {component.openModal(el, null, 'EDIT')}},
            {label: "Excluir pessoa", action(el, component=this) {component.deletePerson(el)}}, 
            ]);
        })
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.token,
        username: state.username
    }
}

export default connect(mapStateToProps)(Tree);