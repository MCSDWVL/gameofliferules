//-----------------------------------------------------------------------------
// 
//-----------------------------------------------------------------------------
function LifeManager()
{
	// split board into pieces and only update when we need to
	this.m_sectorNeedsUpdate = new Array(NUM_SECTORS);
	for (var i = 0; i < NUM_SECTORS; ++i)
		this.m_sectorNeedsUpdate[i] = true;

	//this.m_rulesB = Array(false, false, false, false, false, false, false, false, false);
	//this.m_rulesS = Array(false, false, false, false, false, false, false, false, false);

    // conway
	//this.m_rulesB[3] = true;
	//this.m_rulesS[2] = this.m_rulesS[3] = true;

	this.m_paused = true;

    // seeds
    //this.m_rulesB[2] = true;

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.UpdateLife = function ()
	{
	    if (this.m_paused)
	        return;

		//console.log("*************Updating Generation " + gGameBoard.m_generation + "*****************************");

		// get copy of array
		var sectorNeedsUpdate = this.m_sectorNeedsUpdate.slice();

		// clear out the array
		for (var i = 0; i < NUM_SECTORS; ++i)
			this.m_sectorNeedsUpdate[i] = false;

		for (var sector = 0; sector < NUM_SECTORS; ++sector)
		{
			if (sectorNeedsUpdate[sector])
			{
				//console.log("---Updating Sector " + sector + "---");
				var firstR = this.GetSectorRow(sector, SECTOR_DIR.SELF) * (ROWS_PER_SECTOR);
				var lastR = firstR + ROWS_PER_SECTOR - 1;
				var firstC = this.GetSectorColumn(sector, SECTOR_DIR.SELF) * (COLS_PER_SECTOR);
				var lastC = firstC + COLS_PER_SECTOR - 1;

				for (var r = firstR; r <= lastR; ++r)
				{
					for (var c = firstC; c <= lastC; ++c)
					{
						var numNeighbors = this.CountNeighbors(r, c);
						var changed = this.UpdateLifeState(r, c, numNeighbors);

						if (changed)
						{
							this.MarkSectorsNeedingUpdate(sector, r, c);
							gGameBoard.m_redrawList.push(gGameBoard.m_gamePieces[gGameBoard.GamePieceIndexPieceAtRowCol(r, c)]);
						}
					}
				}
			}
		}

		gNeedsRedrawn = true;
		gGameBoard.m_generation++;

		if (document.rules.rulesrandomize.checked && gGameBoard.m_generation % 100 == 0)
		    this.ChangeRandomRule();
	}

    //-----------------------------------------------------------------------------
    //-----------------------------------------------------------------------------
	this.MarkSectorsNeedingUpdate = function(sector, r, c)
	{
	    var firstR = this.GetSectorRow(sector, SECTOR_DIR.SELF) * (ROWS_PER_SECTOR);
	    var lastR = firstR + ROWS_PER_SECTOR - 1;
	    var firstC = this.GetSectorColumn(sector, SECTOR_DIR.SELF) * (COLS_PER_SECTOR);
	    var lastC = firstC + COLS_PER_SECTOR - 1;

	    this.m_sectorNeedsUpdate[sector] = true;
	    if (r == firstR)
	        this.m_sectorNeedsUpdate[this.GetSectorIndex(sector, SECTOR_DIR.UP)] = true;
	    if (r == lastR)
	        this.m_sectorNeedsUpdate[this.GetSectorIndex(sector, SECTOR_DIR.DOWN)] = true;
	    if (c == firstC)
	        this.m_sectorNeedsUpdate[this.GetSectorIndex(sector, SECTOR_DIR.LEFT)] = true;
	    if (c == lastC)
	        this.m_sectorNeedsUpdate[this.GetSectorIndex(sector, SECTOR_DIR.RIGHT)] = true;

        // literally corner cases
	    if ((r == lastR || r == firstR) && (c == lastC || c == firstC)) {
	        var col = this.GetSectorColumn(sector, (c == lastC) ? SECTOR_DIR.RIGHT : SECTOR_DIR.LEFT);
	        var row = this.GetSectorRow(sector, (r == lastR) ? SECTOR_DIR.DOWN : SECTOR_DIR.UP);
	        this.m_sectorNeedsUpdate[row * VERTICAL_SECTORS + col] = true;
	    }
	}

    //-----------------------------------------------------------------------------
    //-----------------------------------------------------------------------------
	this.ForceLiveInversion = function(row, col)
	{
	    var piece = gGameBoard.m_gamePieces[gGameBoard.GamePieceIndexPieceAtRowCol(row, col)];
	    piece.m_isAlive[gGameBoard.m_generation % 2] = !piece.m_isAlive[gGameBoard.m_generation % 2];
		gGameBoard.m_redrawList.push(piece);
	    var sector = this.GetSectorIndexOfPiece(piece);
	    this.MarkSectorsNeedingUpdate(sector, row, col);
	    gNeedsRedrawn = true;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetSectorRow = function (currSec, dir)
	{
		var row = Math.floor(currSec / VERTICAL_SECTORS);
		if(dir == SECTOR_DIR.DOWN)
			row++;
		if(dir == SECTOR_DIR.UP)
			row--;

		if(row < 0) row = HORIZONTAL_SECTORS + row;
		row = row % HORIZONTAL_SECTORS;
		return row;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetSectorColumn = function (currSec, dir)
	{
		var col = Math.floor(currSec % VERTICAL_SECTORS);
		if(dir == SECTOR_DIR.RIGHT)
			col++;
		if(dir == SECTOR_DIR.LEFT)
			col--;

		if(col < 0) col = VERTICAL_SECTORS + col;
		col = col % VERTICAL_SECTORS;
		return col;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetSectorIndex = function (currSec, dir)
	{
		var row = this.GetSectorRow(currSec, dir);
		var col = this.GetSectorColumn(currSec, dir);

		// pretty sure this idx will always be valid?
		return row*VERTICAL_SECTORS + col;
	}

    //-----------------------------------------------------------------------------
    //-----------------------------------------------------------------------------
	this.GetSectorIndexOfPiece = function (piece)
	{
	    var prow = piece.GetRow();
	    var pcol = piece.GetColumn();
	    var srow = Math.floor(prow / ROWS_PER_SECTOR);
	    var scol = Math.floor(pcol / COLS_PER_SECTOR);
	    return srow * VERTICAL_SECTORS + scol;
	}

    //-----------------------------------------------------------------------------
    //-----------------------------------------------------------------------------
	this.QueueFullUpdate = function ()
	{
	    for (var sector = 0; sector < NUM_SECTORS; ++sector)
	        this.m_sectorNeedsUpdate[sector] = true;
	}

    //-----------------------------------------------------------------------------
    //-----------------------------------------------------------------------------
	this.ChangeRandomRule = function ()
	{
	    var doB = Math.floor(Math.random()*1000) % 2;
	    var whichRule = Math.floor(Math.random()*1000) % 9;

	    if (doB == 1 && whichRule != 0)
	        document.rules.rulesB[whichRule].checked = !document.rules.rulesB[whichRule].checked;
	    else
	        document.rules.rulesS[whichRule].checked = !document.rules.rulesS[whichRule].checked;
	    this.QueueFullUpdate();
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.IsLiving = function (r, c)
	{
		return gGameBoard.m_gamePieces[gGameBoard.GamePieceIndexPieceAtRowCol(r, c)].m_isAlive[(gGameBoard.m_generation) % 2];
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.LifeNextGen = function(r, c, alive)
	{
		gGameBoard.m_gamePieces[gGameBoard.GamePieceIndexPieceAtRowCol(r, c)].m_isAlive[(gGameBoard.m_generation+1) % 2] = alive;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.LifeThisGen = function (r, c, alive)
	{
		gGameBoard.m_gamePieces[gGameBoard.GamePieceIndexPieceAtRowCol(r, c)].m_isAlive[(gGameBoard.m_generation) % 2] = alive;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.UpdateLifeState = function (r, c, numNeighbors)
	{
		var isLiving = this.IsLiving(r, c);
		var lifeNextGen = (!isLiving && document.rules.rulesB[numNeighbors].checked) || (isLiving && document.rules.rulesS[numNeighbors].checked);
		this.LifeNextGen(r, c, lifeNextGen);

		return isLiving != lifeNextGen;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.CountNeighbors = function (r, c)
	{
		var doneCheckingNeighbors = false;
		var numNeighbors = 0;
		for (var h = -1; h <= 1 && !doneCheckingNeighbors; ++h)
		{
			for (var v = -1; v <= 1 && !doneCheckingNeighbors; ++v)
			{
				if (v == 0 && h == 0)
					continue;
				if (this.IsLiving(r + h, c + v))
					numNeighbors++;
			}
		}
		return numNeighbors;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.CreateGliderAt = function (r, c)
	{
		this.LifeThisGen(r + 0, c + 0, true);
		this.LifeThisGen(r + 0, c + 2, true);
		this.LifeThisGen(r + 1, c + 1, true);
		this.LifeThisGen(r + 1, c + 2, true);
		this.LifeThisGen(r + 2, c + 1, true);
		gNeedsRedrawn = true;
	}
}
