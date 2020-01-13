import React from 'react';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
//import './App.css';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Table, InputGroup, InputGroupAddon, Input } from 'reactstrap';
import { Label, Col } from 'reactstrap';

const API_URL = 'http://localhost:5000';

class App extends React.Component {
  
  constructor(props){
    super(props);
    this.state = {
      tasks: [],
      modal: false,
      socket: null,
      curId: '',
      curCreatedAt: '',
      curUpdatedAt: '',
      curDueDate: '',
      curResolvedAt: '',
      curTitle: '',
      curDescription: '',
      curPriority: '',
      curStatus: ''
    };
  }

  componentDidMount() {
    this.loadTasks();

    const socket = socketIOClient(API_URL);
    this.setState({socket: socket});

    socket.on('fromServer', data => {
      console.log('fromServer:' + data);
      if (data === 'reload'){
        this.loadTasks();
      }
    });
  }

  loadTasks = () => {
    const url = `${API_URL}/tasks/`;
    axios.get(url).then(response => response.data)
    .then((data) => {
      console.log(data);
      this.setState({ tasks: data });
    });
  }

  saveTask = () => {
    const url = `${API_URL}/tasks/${this.state.curId}`;
    axios.put(url, {
      title: this.state.curTitle,
      dueDate: this.state.curDueDate,
      description: this.state.curDescription,
      priority: this.state.curPriority,
      status: this.state.curStatus
    }).then(response => {
      this.toggle();
      this.loadTasks();
    });
  }

  postponeTask = (id) => {
    console.log('postpone id:' + id);

    const url = `${API_URL}/tasks/${id}`;
    axios.put(url, {      
      postponeUntil: 'a'
    }).then(response => {
      this.loadTasks();
    });
  }

  deleteTask = (id) => {
    console.log('delete id:' + id);

    const url = `${API_URL}/tasks/${id}`;
    axios.delete(url)
    .then(response => {
      console.log('delete result:' + response.data);
      this.loadTasks();
    });      
  }

  toggle = () => {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  handleChange = (e) => {
		console.log(e.target.name)
		console.log(e.target.value)
		this.setState({ [e.target.name]: e.target.value })
  }
  
  handleDetail = (id) => {
    console.log('handleDetail:' + id);
    console.log(this.state.tasks.length);
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
    
    for (let i in this.state.tasks) {
      console.log('no, task-id:' + i + "," + this.state.tasks[i].id);
      if (this.state.tasks[i].id === id){        
        var formatedDueDate = new Date(this.state.tasks[i].dueDate).toISOString().slice(0,19).replace('T', ' ');
        var formatedCreatedAt = new Date(this.state.tasks[i].createdAt).toISOString().slice(0,19).replace('T', ' ');
        var formatedUpdatedAt = new Date(this.state.tasks[i].updatedAt).toISOString().slice(0,19).replace('T', ' ');
        var formatedResolvedAt = new Date(this.state.tasks[i].resolvedAt).toISOString().slice(0,19).replace('T', ' ');
        
        this.setState({
          curId: this.state.tasks[i].id,
          curCreatedAt: formatedCreatedAt,
          curUpdatedAt: formatedUpdatedAt,
          curDueDate: formatedDueDate,
          curResolvedAt: formatedResolvedAt,
          curTitle: this.state.tasks[i].title,
          curDescription: this.state.tasks[i].description,
          curPriority: this.state.tasks[i].priority,
          curStatus: this.state.tasks[i].status
        });
        console.log('curTitle:' + this.state.curCreatedAt);
        break;
      }
    }
  }
  
  render() {
    return (
      <div>
        <Table borderd="true">
          <thead>
            <tr>
              {/* <th>#</th> */}
              <th>Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>DueDate</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {this.state.tasks.map((task) => (
              <tr key={task.id}>
                {/* <th scope="row">x</th> */}
                <td>{task.title}</td>
                <td>{task.priority}</td>
                <td>{task.status}</td>
                <td>{task.dueDate}</td>
                <td>
                  <Button outline color="primary" size="sm" onClick={ () => this.handleDetail(task.id) }>Detail</Button>
                  <Button outline color="info" size="sm" onClick={ () => this.postponeTask(task.id) }>Postpone</Button>
                  <Button outline color="danger" size="sm"onClick={ () => this.deleteTask(task.id) }>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Modal isOpen={this.state.modal} toggle={this.toggle} className ={this.props.className}>
          <ModalHeader toggle={this.toggle}>{this.state.curTitle}</ModalHeader>
          <ModalBody>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <Col sm={5}>
                  <Label sm={2}>Title</Label>
                </Col>                
                <Col sm={10}>
                  <Input name='curTitle' value={this.state.curTitle} onChange={this.handleChange}/>
                </Col>
              </InputGroupAddon>              
					  </InputGroup>
            
            <InputGroup>
              <InputGroupAddon addonType="prepend">
              <Col sm={4}>
                <Label sm={2}>Description</Label>
              </Col>
              <Col sm={8}>
                <Input name='curDescription' type="textarea" value={this.state.curDescription} onChange={this.handleChange}/>
              </Col>
              </InputGroupAddon>              
					  </InputGroup>

            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <Col sm={5}>
                  <Label sm={2}>Priority</Label>
                </Col>                
                <Col sm={10}>
                  <Input name='curPriority' value={this.state.curPriority} onChange={this.handleChange}/>
                </Col>
              </InputGroupAddon>              
					  </InputGroup>

            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <Col sm={6}>
                  <Label sm={2}>Status</Label>
                </Col>                
                <Col sm={10}>
                  <Input name='curStatus' type="select" value={this.state.curStatus} onChange={this.handleChange}>
                    <option>Normal</option>
                    <option>Urgent</option>
                    <option>Lazy</option>
                  </Input>
                </Col>
              </InputGroupAddon>              
					  </InputGroup>

            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <Col sm={4}>
                  <Label sm={2}>DueDate</Label>
                </Col>
                <Col sm={10}>
                  <Input name='curDueDate' value={this.state.curDueDate} onChange={this.handleChange}/>
                </Col>
              </InputGroupAddon>              
					  </InputGroup>

            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <Col sm={4}>
                  <Label sm={2}>CreatedAt</Label>  
                </Col>
                <Col sm={10}>
                  <Input name='curCreatedAt' value={this.state.curCreatedAt} onChange={this.handleChange}/>
                </Col>
              </InputGroupAddon>              
					  </InputGroup>

            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <Col sm={4}>
                  <Label sm={2}>UpdatedAt</Label>
                </Col>
                <Col sm={10}>
                  <Input name='curUpdatedAt' value={this.state.curUpdatedAt} onChange={this.handleChange}/>
                </Col>
              </InputGroupAddon>              
					  </InputGroup>

            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <Col sm={4}>
                  <Label sm={2}>ResolvedAt</Label>
                </Col>
                <Col sm={10}>
                  <Input name='curResolvedAt' value={this.state.curResolvedAt} onChange={this.handleChange}/>
                </Col>
              </InputGroupAddon>              
					  </InputGroup>

          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.saveTask}>Save</Button>
            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  };  
}

export default App;
