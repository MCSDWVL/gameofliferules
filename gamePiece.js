function LINE_LENGTH()  {return  Math.floor(750 / (NUM_ROWS+10)); }
function LINE_WIDTH() {return Math.floor(LINE_LENGTH / 50.0); }
function FONT_SIZE_PT() {return LINE_LENGTH * .6; }
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function GridPiece()
{
	//
	this.m_Row = -1;
	this.m_Col = -1;
	this.m_isAlive = [false, false]; // two life states so we don't have to copy the whole array every time we update it, just switch back and forth which field is "active"
	
	// define some of the positions around the hex that we'll need later
	var x0, x1;
	var y0, y1;

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.EstablishPoints = function() 
	{
		// all the vertices of the hex
		x0 = this.GetX();
		x1 = x0 + LINE_LENGTH();
		y0 = this.GetY();
		y1 = y0 + LINE_LENGTH();
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetHeight = function() { return LINE_LENGTH(); }
	this.GetWidth = function() { return LINE_LENGTH(); }

	//-----------------------------------------------------------------------------
	// GetX - the left of the guy
	//-----------------------------------------------------------------------------
	this.GetX = function()
	{
		var leftMost = 10;

		// special case for the active piece
		return leftMost + this.GetColumn() * (this.GetWidth());
	}

	//-----------------------------------------------------------------------------
	// GetY - top of the tile
	//-----------------------------------------------------------------------------
	this.GetY = function() 
	{
		var topMost = 10;
		return topMost + this.GetRow() * this.GetHeight();
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetColumn = function()
	{
		return this.m_Col;
	}
	
	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetRow = function()
	{
		return this.m_Row;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.Draw = function (context, colorIt)
	{
		// Set the style properties
		if (this.m_isAlive[gGameBoard.m_generation % 2])
		{
			context.fillStyle = '#f11';
		}
		else
		{
			if (Math.floor(this.GetRow() / 5) % 2 == Math.floor(this.GetColumn() / 5) % 2)
				context.fillStyle = '#eee';
			else
				context.fillStyle = '#fff';
		}

		context.strokeStyle = '#000';
		context.lineWidth = LINE_WIDTH();

		context.beginPath();

		// Start from the top-left point.

		context.moveTo(x0, y0);
		context.lineTo(x1, y0); // lower
		context.lineTo(x1, y1); // right
		context.lineTo(x0, y1); // upper
		context.lineTo(x0, y0); // left

		// Done! Now fill the shape, and draw the stroke.
		// Note: your shape will not be visible until you call any of the two methods.
		context.fill();
		//context.stroke();
		context.closePath();
	}
	
	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.toString = function() 
	{
		return "GP (" + this.GetRow() + ", " + this.GetColumn() + ")";
	}
}