var gNeedsRedrawn = true;
var INTERVAL_TIME = 20;
var gGameBoard;
var NUM_ROWS = 90;
var NUM_COLS = 90;
var gGameOver = false;
var gScore = 0;
var regOnce = false;
var gLifeManager;
var TIME_BETWEEN_GENERATIONS = 20;

var UPDATE_LOOP_TIME = 20;

var PERCENT_LIVE_AT_START = 0.5;
// Directions 
var SECTOR_DIR =
{
	"LEFT": 0,
	"UP": 1,
	"RIGHT": 2,
	"DOWN": 3,
	"SELF": 4,
	"NUM_DIRECTIONS": 5
}

// these numbers have to evenly divide the number of rows and columns or bad things will happen
var SECTOR_WIDTH = 3;
var SECTOR_HEIGHT = 3;
var HORIZONTAL_SECTORS = NUM_ROWS / SECTOR_WIDTH;
var VERTICAL_SECTORS = NUM_COLS / SECTOR_HEIGHT;
var NUM_SECTORS = HORIZONTAL_SECTORS * VERTICAL_SECTORS;
var ROWS_PER_SECTOR = Math.floor(NUM_ROWS / HORIZONTAL_SECTORS);
var COLS_PER_SECTOR = Math.floor(NUM_COLS / VERTICAL_SECTORS);

// Directions 
var DIRECTION =
{
	"LEFT": 37,
	"UP": 38,
	"RIGHT": 39,
	"DOWN": 40,
	"NUM_DIRECTIONS": 4
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function getUrlVars()
{
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for (var i = 0; i < hashes.length; i++)
	{
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function Init()
{
	// get url vals
	var urlVars = getUrlVars();
	var rand = false;

	if (urlVars["rand"])
	{
		rand = true;
	}

	// reset game state
	gGameOver = false;

	// get the canvas
	var drawingCanvas = document.getElementById('myDrawing');

	// create the game board
	gGameBoard = new GameBoard();
	gGameBoard.InitEmptyGrid();

	gLifeManager = new LifeManager();

	//gLifeManager.CreateGliderAt(1, 20);

	// schedule drawing
	Draw();

	// capture mouse events
	if (regOnce == false)
	{
		// don't do this again or everything will go twice as fast
		regOnce = true;
		
		// schedule update loop
		setInterval(UpdateLoop, UPDATE_LOOP_TIME);
		
		// hook up events
		window.addEventListener('keydown', ev_keydown, false);
		drawingCanvas.addEventListener('mousedown', ev_mousedown, false);
		drawingCanvas.addEventListener('mouseup', ev_mouseup, false);
		drawingCanvas.addEventListener('mousemove', ev_mousemove, false);
	}
	

	// is it too big
	if (((LINE_LENGTH) * (NUM_COLS + 2)) + FONT_SIZE_PT > drawingCanvas.height)
		alert("oops canvas isn't tall enough");
	if(LINE_LENGTH * NUM_ROWS > drawingCanvas.width)
		alert("oops canvas isn't wide enough");
}

//-----------------------------------------------------------------------------
// draw everything if state has changed
//-----------------------------------------------------------------------------
function Draw()
{
	// don't do anything if state hasn't changed
	if (gNeedsRedrawn == false)
		return;

	// get the drawing canvas and draw
	var drawingCanvas = document.getElementById('myDrawing');
	if (drawingCanvas.getContext)
	{
		// we need to redraw only once per state change
		gNeedsRedrawn = false;
		
		// get the context
		var context = drawingCanvas.getContext('2d');

		if (gGameOver == false)
		{
			// draw game objects
			gGameBoard.Draw(context);

			var textX = 50;
			var textY = (LINE_LENGTH) * (NUM_COLS + 2);

			/*
			context.clearRect(textX, textY-(FONT_SIZE_PT*2), drawingCanvas.width, drawingCanvas.height);
			context.font = FONT_SIZE_PT + "pt arial";
			context.fillStyle = '#000';
			context.fillText("LETTERS: " + gLetters, textX, textY);
			context.fillText("SCORE: " + Math.round(gScore * 100) / 100, textX, textY + FONT_SIZE_PT);
			context.fillText("MULTIPLIER: " + Math.round(gMultiplier * 100) / 100, textX, textY + 2 * FONT_SIZE_PT);
			context.fillText(gStatus, textX, textY + 3 * FONT_SIZE_PT);
			*/
		}
		else
		{
			context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
			var textX = 50;
			var textY = 50;
			context.font = FONT_SIZE_PT + "pt arial";
			context.fillStyle = '#000';

			/*
			context.fillText("GAME OVER", textX, textY);
			context.fillText("SCORE: " + Math.round(gScore*100)/100, textX, textY + FONT_SIZE_PT);
			context.fillText("CLICK TO START OVER", textX, textY + 2 * FONT_SIZE_PT);
			*/
		}
	}
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function NeedToRedraw()
{
	gNeedsRedrawn = true;
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function ev_keydown(ev)
{
	/*
	//console.log(ev.keyCode);
	if (gGameOver)
	{
		Init();
		return;
	}
	if (ev.keyCode >= DIRECTION.LEFT && ev.keyCode <= DIRECTION.DOWN) 
	{
		gSnakeManager.ChangeDirection(ev.keyCode);
	}
    */
	
    if(ev.keyCode == 32) // space
	{
	    TogglePause();
	}
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function TogglePause()
{
    gLifeManager.m_paused = !gLifeManager.m_paused;
    document.getElementById("togglepause").value = gLifeManager.m_paused ? "run" : "pause";
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function QueueFullUpdate()
{
    gLifeManager.QueueFullUpdate();
}

function Clear()
{
    gGameBoard.InitEmptyGrid();
    QueueFullUpdate();
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
var gDrawingCells = false;
var gCreate = false;
function ev_mousedown(e)
{
    //if (gLifeManager.m_paused == false)
        //return;
    gDrawingCells = true;
    var drawingCanvas = document.getElementById('myDrawing');
    var x;
    var y;
    if (e.pageX || e.pageY)
    {
        x = e.pageX;
        y = e.pageY;
    }
    else
    {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= drawingCanvas.offsetLeft;
    y -= drawingCanvas.offsetTop;

    var leftMost = 10;
    var col = Math.floor((x - leftMost) / gGameBoard.m_gamePieces[0].GetWidth());
    var row = Math.floor((y - leftMost) / gGameBoard.m_gamePieces[0].GetHeight());
    gLifeManager.ForceLiveInversion(row, col);

    gCreate = gGameBoard.m_gamePieces[gGameBoard.GamePieceIndexPieceAtRowCol(row, col)].m_isAlive[gGameBoard.m_generation % 2];
}

function ev_mouseup(e)
{
    gDrawingCells = false;
}

function ev_mousemove(e)
{
    if(gDrawingCells == false)
        return;
    var drawingCanvas = document.getElementById('myDrawing');
    var x;
    var y;
    if (e.pageX || e.pageY)
    {
        x = e.pageX;
        y = e.pageY;
    }
    else
    {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= drawingCanvas.offsetLeft;
    y -= drawingCanvas.offsetTop;

    var leftMost = 10;
    var col = Math.floor((x - leftMost) / gGameBoard.m_gamePieces[0].GetWidth());
    var row = Math.floor((y - leftMost) / gGameBoard.m_gamePieces[0].GetHeight());

    if(gCreate != gGameBoard.m_gamePieces[gGameBoard.GamePieceIndexPieceAtRowCol(row, col)].m_isAlive[gGameBoard.m_generation % 2])
        gLifeManager.ForceLiveInversion(row, col);
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function RandomizeGameboard()
{
    // init some % of the board to letters
    for (var i = 0; i < NUM_ROWS * NUM_COLS * PERCENT_LIVE_AT_START; ++i)
    {
        ToggleRandomPiece();
    }
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function ToggleRandomPiece()
{
    gLifeManager.ForceLiveInversion(Math.floor(Math.random() * NUM_ROWS), Math.floor(Math.random() * NUM_COLS));
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function UpdateLoop()
{
	UpdateLife();
	Draw();
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function UpdateLife()
{
	gLifeManager.UpdateLife();
}


