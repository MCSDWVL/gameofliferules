//-----------------------------------------------------------------------------
// 
//-----------------------------------------------------------------------------
function GameBoard()
{
	this.m_gamePieces = new Array();
	this.m_generation = 0;
	this.m_redrawList = new Array();
	
	//-----------------------------------------------------------------------------
	// Draw - just pass on to all the game pieces?
	//-----------------------------------------------------------------------------
	/*
	this.Draw = function(context)
	{
		for (var i = 0; i < this.m_gamePieces.length; ++i)
		{
			var color = false;
			this.m_gamePieces[i].Draw(context, color);
		}
	}
	*/

	/*
	this.Draw = function (context)
	{
		for (var sector = 0; sector < NUM_SECTORS; ++sector)
		{
			if (gLifeManager.m_sectorNeedsUpdate[sector])
			{
				//console.log("---Updating Sector " + sector + "---");
				var firstR = gLifeManager.GetSectorRow(sector, SECTOR_DIR.SELF) * (ROWS_PER_SECTOR);
				var lastR = firstR + ROWS_PER_SECTOR - 1;
				var firstC = gLifeManager.GetSectorColumn(sector, SECTOR_DIR.SELF) * (COLS_PER_SECTOR);
				var lastC = firstC + COLS_PER_SECTOR - 1;

				for (var r = firstR; r <= lastR; ++r)
				{
					for (var c = firstC; c <= lastC; ++c)
					{
						this.m_gamePieces[this.GamePieceIndexPieceAtRowCol(r, c)].Draw(context, false);
					}
				}
			}
		}
	}
	*/

	this.Draw = function (context)
	{
		for (var i = 0; i < this.m_redrawList.length; ++i)
		{
			this.m_redrawList[i].Draw(context, false);
		}

		// "clear" the array by just forgetting we ever had any... stack overflow said to do it
		this.m_redrawList.length = 0;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GamePieceIndexPieceAtRowCol = function(row, col)
	{
		// wrap down to valid row and col
		if (row < 0) row = NUM_ROWS + (row);
		if (col < 0) col = NUM_COLS + (col);
		row = row % NUM_ROWS;
		col = col % NUM_COLS;

		// find the one that matches
		return row * NUM_COLS + col;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.InitEmptyGrid = function ()
	{
		var ctr = 0;
		for (var row = 0; row < NUM_ROWS; ++row)
		{
			for (var col = 0; col < NUM_COLS; ++col)
			{
				var gp = new GridPiece();
				gp.m_Row = row;
				gp.m_Col = col;
				gp.EstablishPoints();
				this.m_gamePieces[ctr++] = gp;
				this.m_redrawList.push(gp);
			}
		}
		gNeedsRedrawn = true;
	}
	
	
	
}
