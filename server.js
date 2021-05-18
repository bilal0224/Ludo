const http = require(`http`)
const fs = require(`fs`)
const WebSocket = require(`ws`)

const readFile = (fileName) =>
  new Promise((resolve, reject) => {
    fs.readFile(fileName, (readErr, fileContents) => {
      if (readErr) {
        reject(readErr)
      } else {
        resolve(fileContents)
      }
    })
  })

const server = http.createServer(async(req,resp) =>{
    console.log(`browser asked for ${req.url}`)
    if (req.url == '/mydoc'){
        const clientHtml = await readFile(`client.html`)
        resp.end(clientHtml)}
    else if (req.url == '/myjs'){
        const clientJs = await readFile(`client.js`)
        resp.end(clientJs)
    }
    else if(req.url == '/ludo.css'){
        const clientLudo = await readFile(`ludo.css`)
        resp.end(clientLudo)
    }
    else if(req.url == `/center.png`)
    {
        const clientPic = await readFile(`center.png`)
        resp.end(clientPic)
    }
    else
    {
        resp.end('Not found')
    }
})
server.listen(8002)

const wss = new WebSocket.Server({port:8003})

var fullNewBoard = [[['blue','blue','blue','blue'],[],[],[],[],[],[],[],[],[],[],[],[],[]
,['red','red','red','red']],[[],[],[],[],[],[],[],[],[],[],[],[],[],[]
,[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[]
,[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[
],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[
],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],
[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],
[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[]
,[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[]
,[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[
],[],[]],[['yellow','yellow','yellow','yellow'],[],[],[],[],[],[],[],[
],[],[],[],[],[],['green','green','green','green']]]

const step = (color, ox, oy, steps) => {
  const transform = ([ox,oy]) => ({'blue': [+ox,+oy], 'green': [-
 ox,-oy], 'red': [-oy,+ox], 'yellow': [+oy,-ox]}[color])
  const path = ['-7,-7', '-1,-6', '-1,-5', '-1,-4', '-1,-3', '-1,-2', '-2,-1', '-3,-1', '-4,-1', '-5,-1', '-6,-1', '-7,-1', '-7,0', '-7,1', '-6,1', '-5,1', '-4,1', '-3,1', '-2,1', '-1,2', '-1,3', '-1,4',
 '-1,5', '-1,6', '-1,7', '0,7', '1,7', '1,6', '1,5', '1,4', '1,3',
 '1,2', '2,1', '3,1', '4,1', '5,1', '6,1', '7,1', '7,0', '7,-1', '6,-1', '5,-1', '4,-1', '3,-1', '2,-1', '1,-2', '1,-3', '1,-4', '1,-5',
 '1,-6', '1,-7', '0,-7', '0,-6', '0,-5', '0,-4', '0,-3', '0,-2', '0,-1']
  const [x,y] =
 transform(transform(transform(path[path.indexOf(transform([ox-7, oy-7]).join(','))+steps].split(','))))
  return [x+7,y+7]
 }

 const iskilled = (ox, oy) => (ox-7)*(ox-7)+(oy-7)*(oy-7) == 98

 const safeSpots =(arr) =>{
  const safeSpotsArray =[[1,8],[2,6],[6,1],[8,2],[8,13],[6,12],[13,6],[12,8]]
  for(var i=0; i < safeSpotsArray.length ; i++)
  {
    if(JSON.stringify(arr) == JSON.stringify(safeSpotsArray[i]))
    {
      return true
    } 
  }
  return false
 }
 
var arr=[];
var cl=[]
var colorsArray =['blue','red','green','yellow']
const turn_list=['blue','red','green','yellow']
var killed_arr =[] 
var count =0
var turn_value;
var dice_value=Math.floor(Math.random() * 6) + 1;

wss.on(`connection`,(ws) => {
    console.log(`A uesr connected.`)
    cl.push(ws)
    ws.send(JSON.stringify({
        type: `newboard`,
        board: fullNewBoard,
        username: `server`
    }))
    
    ws.send(JSON.stringify({
      type: `dice`,
      value: dice_value,
      username:`server`
    }))
    
    var col=colorsArray[0]
    colorsArray.splice(0,1)

    ws.send(JSON.stringify({
      type:`color`,
      message: col,
      username:`server`
    }))
    
    ws.send(JSON.stringify({
      type:`turn`,
      message: turn_list[count],
      username:`server`
    }))
    
    ws.on('message', (data) =>{
    if(cl.length== 4)
    {
      const parsed_data=JSON.parse(data)
      
      if (parsed_data.type == `coordinates`)
      {
        message_coordinates = parsed_data.message
        arr_coordinates = message_coordinates.split(" ")
        const c = arr_coordinates[0]
        var x = Number(arr_coordinates[1])
        var y = Number(arr_coordinates[2])
        var kill = iskilled(x,y)
        var updated_coordinates;

        if (kill == true)
        {
          if(dice_value == 6)
          {
            updated_coordinates =step(c,x,y,1)
            dice_value= Math.floor(Math.random() * 6) + 1;
            fullNewBoard[x][y].splice(0,1)
            fullNewBoard[updated_coordinates[0]][updated_coordinates[1]].push(c)
            
          }
          else{
            dice_value= Math.floor(Math.random() * 6) + 1;
          }
        }
        
        else{
            if(c=='green' && x==7 && y>7 && ((y-dice_value) <8) )
            {
              fullNewBoard[x][y]
            }
            else if(c=='blue' && x==7 && y<7 && ((y+dice_value) >6))
            {
              fullNewBoard[x][y]
            }
            else if(c== 'red' && y==7 && x<7 &&((x+dice_value) >6))
            {
              fullNewBoard[x][y]
            }
            else if(c== 'yellow' && y==7 && x>7 && ((x-dice_value) <8))
            {
              fullNewBoard[x][y]
            }

          else{
          
          updated_coordinates =step(c,x,y,dice_value)
          arr = fullNewBoard[updated_coordinates[0]][updated_coordinates[1]]
          var counter =0;
          for(var i=0; i< arr.length ;i++)
          {
            if (arr[i] != c )
            {
              counter = counter+1;
              killed_arr.push(arr[i])
            }
          }
          if(counter >0)
          {
            if(safeSpots(updated_coordinates))
            {
              dice_value= Math.floor(Math.random() * 6) + 1;
              fullNewBoard[x][y].splice(0,1)
              fullNewBoard[updated_coordinates[0]][updated_coordinates[1]].push(c)
            }
            else{
            dice_value= Math.floor(Math.random() * 6) + 1;
            fullNewBoard[x][y].splice(0,1)
            fullNewBoard[updated_coordinates[0]][updated_coordinates[1]].splice(0,counter)
            fullNewBoard[updated_coordinates[0]][updated_coordinates[1]].push(c)
            
            for(var j=0; j<killed_arr.length; j++)
            {
              if(killed_arr[j]=='blue')
              {
                fullNewBoard[0][0].push('blue')
              }
              else if(killed_arr[j]=='red')
              {
                fullNewBoard[0][14].push('red')
              }
              else if(killed_arr[j]=='green')
              {
                fullNewBoard[14][14].push('green')
              }
              else
              {
                fullNewBoard[14][0].push('yellow')
              }
            }
            killed_arr=[]
          }
          }
          else{
          dice_value= Math.floor(Math.random() * 6) + 1;
          fullNewBoard[x][y].splice(0,1)
          fullNewBoard[updated_coordinates[0]][updated_coordinates[1]].push(c)

          if(fullNewBoard[7][6].length==4)
          {
            const mess4=JSON.stringify({
              type: `win`,
              winMessage: "BLUE WON!!",
              username: `server` 
            })
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(mess4)
              }
            })
          }
          else if(fullNewBoard[6][7].length==4)
          {
            const mess4=JSON.stringify({
              type: `win`,
              winMessage: "RED WON!!",
              username: `server` 
            })
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(mess4)
              }
            })
          }
          else if(fullNewBoard[7][8].length==4)
          {
            const mess4=JSON.stringify({
              type: `win`,
              winMessage: "GREEN WON!!",
              username: `server` 
            })
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(mess4)
              }
            })
          }
          else if(fullNewBoard[8][7].length==4){
            const mess4=JSON.stringify({
              type: `win`,
              winMessage: "YELLOW WON!!",
              username: `server` 
            })
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(mess4)
              }
            })
          }
          }
        }
      }
        count=count+1
        if(count == 4)
        {
          count=0
        }
        turn_value = turn_list[count]

        mess1=JSON.stringify({
          type: `newboard`,
          board: fullNewBoard,
          username: `server` 
        })
        mess2= JSON.stringify({
          type: `dice`,
          value: dice_value,
          username:`server`
        })
        mess3= JSON.stringify({
          type: `turn`,
          message: turn_value,
          username:`server`
        })
      
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(mess1)
            client.send(mess2)
            client.send(mess3)
          }
        })
      
      }
     }
     })
})




