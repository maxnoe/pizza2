"use strict";

function errorMessage(msg) {
  console.log(msg);
  var div = $('<div>', {"class": 'alert alert-danger alert-dismissable'});
  div.html('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
  div.append($('<strong>').text(msg));
  return $('#orders-panel').before(div);
}

function successMessage(msg) {
  console.log(msg);
  var div = $('<div>', {"class": 'alert alert-success alert-dismissable'});
  div.html('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
  div.append($('<strong>').text(msg));
  return $('#orders-panel').before(div);
}

function handleError(response) {
  errorMessage(response.responseJSON.msg);
}

let app


window.onload = function() {
  app = new Vue({
    el: '#app',
    data: {
      currentPizzeria: {},
      pizzerias: [],
      orders: [],
      newOrder: {},
      newPizzeria: {link: '', name:''},
      selectedPizzeriaID: 1
    },
    methods: {
      getOrders: function () {
        $.getJSON(root + 'orders', {}, this.updateOrders);
      },
      getPizzerias: function () {
        $.getJSON(root + 'pizzerias', {}, this.updatePizzerias);
      },
      updateOrders: function  (orders, textStatus, jqXHR) {
        this.orders = orders.map((order, i)  => {
          order["timestamp"] = moment.utc(order["timestamp"]).local().format("DD.MM. HH:mm");
          return order;
        });
      },
      updatePizzerias: function  (pizzerias, textStatus, jqXHR) {
        this.pizzerias = pizzerias;
        var activePizzerias = pizzerias.filter((pizzeria, i) => {return pizzeria.active;});
        this.currentPizzeria = activePizzerias[0];
        this.selectedPizzeriaID = this.currentPizzeria.id;
      },
      addNewOrder: function() {
        $.post(root + 'orders', this.newOrder, (data) => {console.log(data)});
        this.newOrder = {};
        this.getOrders();
      },
      addNewPizzeria: function() {
        console.log("new Pizzeria");
        console.log(Object.assign({}, this.newPizzeria));
        $.ajax({
          url: root + 'pizzerias',
          type: 'POST',
          data: this.newPizzeria,
          success: (data) => {successMessage("New Pizzeria added");},
          error: handleError,
        });
        this.newPizzeria = {};
      },
      deleteOrders: function() {
        $.ajax({
          url: root + 'orders',
          type: 'DELETE',
          success: (data) => {console.log(data);}
        });
      },
      changePizzeria: function() {
        $.post(root + 'pizzerias/' + this.selectedPizzeriaID, {}, (data) => {console.log(data);});
        this.selectedPizzeriaID = -1;
      },
      deletePizzeria: function() {
        $.ajax({
          url: root + 'pizzerias/' + this.selectedPizzeriaID,
          type: 'DELETE',
          success: (data) => {console.log(data)},
          error: handleError,
        });
      },
      togglePaid: function(id) {
        $.post(root + 'orders/' + id, {}, (data) => {console.log(data)});
      },
      deleteOrder: function(id) {
        $.ajax({
          url: root + 'orders/' + id,
          type: 'DELETE',
          success: (data) => {console.log(data)}
        });
      }
    }
  })

  var root = window.location.pathname;
  if (root != '/'){
    var socket = io({path: root + 'socket.io'});
  } else {
    var socket = io();
  }

  socket.on('orderUpdate', app.getOrders);
  socket.on('pizzeriaUpdate', app.getPizzerias);

  app.getOrders()
  app.getPizzerias()
}
