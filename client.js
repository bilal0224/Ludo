const ws = new WebSocket(`ws://localhost:8003`)

const Ludo= ()=> {
    
    const [turn, setTurn] = React.useState('')
    const [win, setWin] = React.useState('')
    const [color, setColor] = React.useState('blue')
    const [diceVal, setDiceVal] = React.useState(-1)
    const [board, setboard] = React.useState([[['blue','blue','blue','blue'],[],[],[],[],[],[],[],[],[],[],[],[],[]
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
    ],[],[],[],[],[],['green','green','green','green']]])

    ws.onmessage = (event) => {
        const serverMessage =JSON.parse(event.data)
        if (serverMessage.type == `newboard`)
        {
            setboard(serverMessage.board)
        }
        if (serverMessage.type == 'color')
        {
            setColor(serverMessage.message)
        }
        if(serverMessage.type == 'dice')
        {
            setDiceVal(serverMessage.value)
        }
        if(serverMessage.type=="turn")
        {
            setTurn(serverMessage.message)
        }
        if(serverMessage.type=="win"){

            setWin(serverMessage.winMessage)
        }        
    }
    
    const sendServerMessage= (col,ox,oy) =>{
        if(turn == color)
        {
        if(color ==col )
        {
        const x_coordinate = ox.toString()
        const y_coordinate = oy.toString()
        const message = col.concat(" ",x_coordinate," ",y_coordinate)
        const clientMessage = {
            type: `coordinates`,
            message: message,
            username: 'Bilal'
        }
        ws.send(JSON.stringify(clientMessage))
        }
    }
 
    }
    return (
        <div>
        {board.map((items, index) => {
        return (
            
          <div>
            {items.map((subItems, sIndex) => {
              var cellNo = "cell".concat(index.toString(),sIndex.toString())
              if(subItems == [])
              {
              return <div className={cellNo}> </div>;
              }
              else{
                return( 
                <div  className={cellNo}>
                {subItems.map((ssItems,ssIndex) => {
                    return <div onClick={()=>sendServerMessage(ssItems,index,sIndex)} className={ssItems} id={ssIndex} ></div>
                })
                }
                </div>
                )
              }
            })}
          </div>
        );
        })}
        <div className='dice'>{diceVal}</div>
        
        <div className={"color".concat(" ",color)}></div>

        <div className="text_box" >Its {turn}'s turn<div>{win}</div></div> 

    </div>
    )
}
ReactDOM.render(<Ludo />,document.querySelector('#root'))

//How to run : Run server, then connect 4 clients using browser,now you can play game.
//Note: You cannot play game,when there will be less than 4 clients.
//Command for Server: node server.js
//Command for Browser: http://localhost:8002/mydoc 