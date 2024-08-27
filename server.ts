import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { RoomCounter } from "./RoomCounter";
import path from "path";

dotenv.config();
const app = express();
const http = require( "http" );
const server = http.createServer( app );
const io = require( "socket.io" )( server );

const PORT = process.env.PORT;

app.use( express.static( path.join( __dirname ) ) );

app.get( "/", ( request: Request, response: Response ) =>
{
  response.status( 200 ).sendFile( __dirname + "/index.html" );
} );

const roomCounters: { [ key: string ]: RoomCounter } = {};

io.on( "connection", ( socket: Socket ) =>
{
  console.log( "ユーザーが接続しました" )

  socket.on( 'join room', ( room: string ) =>
  {
    socket.join( room );
    if ( !roomCounters[ room ] )
    {
      roomCounters[ room ] = new RoomCounter();
    }
    socket.emit( 'roomCounter', roomCounters[ room ].getCount() );
  } );


  socket.on( "chat message", ( data ) =>
  {
    const { room, msg } = data;
    //クライアントサイドにmessageを送り返す
    io.to( room ).emit( "chat message", msg );
  } )

  socket.on( 'incrementCounter', ( room: string ) => 
  {
    if ( roomCounters[ room ] )
    {
      roomCounters[ room ].increment();
      console.log(`Counter for room ${room} is now ${roomCounters[room].getCount()}`);
      io.to( room ).emit( 'roomCounter', roomCounters[ room ].getCount() );
    }
  } );

  socket.on( 'disconnect', () =>
  {
    console.log( "ユーザーが切断しました" );
  } );

} );

server.listen( PORT, () =>
{
  console.log( "Server running at PORT: ", PORT );
} ).on( "error", ( error: Error ) =>
{
  // エラーの処理
  throw new Error( error.message );
} );