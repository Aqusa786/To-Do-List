//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

mongoose.connect('mongodb+srv://admin-aqusa:Testcase@cluster0.bszcp.mongodb.net/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

 const itemSchema={
    name: String
  };

const Item= mongoose.model("Item", itemSchema);

const item1 = new Item({name:"Welcome to your new to-do list"});
const item2 = new Item({name:"Hit the + button to add the items to list"});
const item3 = new Item({name:"<-- Hit this to delete the item form list"});

const defaultItems=[item1, item2, item3];

const listSchema={
  name: String,
  items:[itemSchema]
};

const List= mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find(function(err,items){
    if (items.length=== 0){
      Item.insertMany(defaultItems, function(err){
      if(err) {
        console.log(err)
        }
        else{
          console.log("successfully inserted")
        }
        res.redirect("/");
      });

    }

    else{
        res.render("list", {listTitle: "Today", newListItems: items});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listFound = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listFound === "Today"){
  item.save();
  res.redirect("/");
}
else{
  List.findOne({name: listFound}, function(err , listName){
  listName.items.push(item);
  listName.save();
  res.redirect("/"+listFound);
});
}
});

app.get("/:paramName", function(req,res){
  const customName= _.capitalize(req.params.paramName);

 List.findOne({name:customName}, function(err, listFound){
   if(!err){
     if(!listFound){
       //create new list
       const list= new List({
         name: customName,
         items: defaultItems
       });
    list.save()
     res.render("list", { listTitle: customName, newListItems:defaultItems});
}
     else{
       res.render("list", { listTitle: listFound.name, newListItems: listFound.items});
     }
   }
   });
 });

app.get("/about", function(req, res){
  res.render("about")
});

app.post("/delete", function(req, res){
 const checkedItemId= req.body.checkbox
 const listName= req.body.listName
 if(listName=== "Today"){
 Item.findByIdAndRemove(checkedItemId, function(err){
   if(err){
     console.log(err)
   }
   else{
     console.log("successfully deleted!");
     res.redirect("/");
   }
 });
}

else{
  List.findOneAndUpdate({name:listName}, {$pull: {items:{_id: checkedItemId}}}, function(err, foundList){
      Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err)
      }
      else{
        console.log("successfully deleted!");
        res.redirect("/"+ listName);
      }
    });
  });
}


});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
