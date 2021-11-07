/*****************************************************************
 Original script by Maksim Bashov 2012-10-23.

 Modified by ShenJia Zhang 2013-11-11. Added Time and 3BV.

 Modified during 2019-02 by Damien Moore. Added ELSE statements so Mode and Marks
 always print (so same number of lines in output), changed Version code to work with
 older versions and to retrieve the third part if it exists (i.e., 0.52.3 or 0.45
 DEBUG), added Style and BBBVS variables and tested parser with all versions since
 0.43 demo3. On 2019-02-22 fixed issue caused by Custom games having more bytes in
 the header. On 2019-02-24 fixed bug caused when score_ths has a leading zero. Also
 fixed errors with Time rounding versus truncating to 3 decimal places.

 Modified by Damien Moore 2020-01-24. Corrected minor error where the leading empty
 space in third part of Version was being deleted. Tidied up code and wrote comments.
 Modified 2020-02-07 to make backwards compatible to 0.35. This is being released as
 Arbiter RAW version 6.

 Updated 2021-05-26 by Damien to remove legacy Freesweeper code and remove Arbiter cheat
 code as Arbiter does not allow cheat mode videos.

 Modified by Enbin Hu (Flop) 2021-11-07. Rewriting with TypeScript.

 Note Arbiter internals operate to 2 decimal places. You cannot get 3 decimal places
 by subtracting timestamp_a from timestamp_b because these timestamps do not perfectly
 match start and finish of the game timer. This versions adds a fake 0 as the third
 decimal place for consistency with the other official minesweeper versions.

 Tested successfully on Arbiter 0.35 and later.
 *****************************************************************/

class AVFVideo {
  private readonly MAX_REP = 100000
  private readonly MAX_NAME = 1000

  // 读取位置
  private position: number = 0
  // 原始数据
  private readonly data: Uint8Array
  // Mode
  private mode = 0
  // Width
  private w = 0
  // Height
  private h = 0
  // Mines
  private m = 0
  // Number of game events
  private size = 0
  // Stores board and mine locations
  private board: number[] = []
  // Questionmarks
  private qm = false
  // Version
  private ver = 0
  // Player name
  private name: string[] = []
  // Skin (since version 0.47)
  private skin: string[] = []
  // Program
  private program: string[] = []
  // Used in getpair() function
  private value: string[] = []
  // Timestamp (when game started)
  private timestamp_a: string[] = []
  // Custom games have 4 extra bytes
  private customdata: string[] = []
  // Game events
  private video: {
    // Seconds
    sec: number
    // Hundredths
    hun: number
    // Thousandths
    ths: number
    x: number
    y: number
    mouse: number
  }[] = []
  // Time in seconds
  private score_sec = 0
  // Time in decimals
  private score_hun = 0
  // The period or space before 3rd part of Version
  private spacer = ''
  // Substring used to fetch Version
  private versionend: string[] = []
  // Substring used to fetch Version
  private versionprint: string[] = []
  // 3bv
  private bbbv = 0
  // Realtime (since version 0.47)
  private realtime = 0.0
  // 3bvs
  private bbbvs = 0.0

  constructor (data: ArrayBuffer) {
    this.data = new Uint8Array(data)
  }

  /**
   * 将字符串转换成整数
   *
   * @param str 要转换为整数的字符串
   * @return {number} 返回转换后的整数，如果没有执行有效的转换，则返回零
   */
  private static atoi (str: string): number {
    return parseInt(str) || 0
  }

  // ==============================================================================================
  // Function is run if there is a parsing error
  // ==============================================================================================
  private _fgetc () {
    const char = this.data[this.position++]
    if (char) {
      return String.fromCharCode(char)
    }
    // TODO 自定义错误
    throw 'Error 4: Unexpected end of file'
  }

  // ==============================================================================================
  // Function is run if there is a parsing error
  // ==============================================================================================
  private _fgeti () {
    const char = this.data[this.position++]
    if (char) {
      return char
    }
    // TODO 自定义错误
    throw 'Error 4: Unexpected end of file'
  }

  // ==============================================================================================
  // Function is used to read Realtime and Skin values
  // ==============================================================================================
  private getpair (c1: string[], c2: string[]) {
    // Initialise local variables
    let i = 0
    let c = ''

    while (c !== ':' && c.charCodeAt(0) !== 13 && i < this.MAX_NAME) {
      c = this._fgetc()
      if (c === '<') {
        c1.length = i
        c2 = []
        while (this._fgeti() !== 13) {
        }
        return
      }
      c1[i++] = c
    }
    c1.length = --i
    i = 0

    while (c.charCodeAt(0) !== 13 && i < this.MAX_NAME) {
      c = this._fgetc()
      c2[i++] = c
    }
    c2.length = i
  }

  // ==============================================================================================
  // Function is used to read video data
  // ==============================================================================================
  private readavf () {
    // Initialise local variables
    let i = 0, cur = 0
    let c = 0, d = 0
    // Create an 8 byte array to store data
    let cr: number[] = new Array(8)

    // Fetch main version from byte 1
    // For example, Arbiter 0.52.2 stores 52 (Hex 34) in byte 1
    c = this._fgeti()
    this.ver = c

    // Throw away next 4 bytes which are not used
    for (i = 0; i < 4; ++i) c = this._fgeti()

    // Fetch Mode from byte 6
    c = this._fgeti()
    this.mode = c - 2

    if (this.mode == 1) {
      this.w = this.h = 8
      this.m = 10
    } else if (this.mode == 2) {
      this.w = this.h = 16
      this.m = 40
    } else if (this.mode == 3) {
      this.w = 30
      this.h = 16
      this.m = 99
    } else if (this.mode == 4) {
      this.w = (c = this._fgeti()) + 1
      this.h = (c = this._fgeti()) + 1
      this.m = (c = this._fgeti())
      this.m = this.m * 256 + (c = this._fgeti())
    } else return 0

    // Fetch board layout and put in memory
    this.board = new Array(this.w * this.h).fill(0)
    for (i = 0; i < this.m; ++i) {
      c = this._fgeti() - 1
      d = this._fgeti() - 1
      this.board[c * this.w + d] = 1
    }

    // Clear the 8 byte array we are using to store data
    for (i = 0; i < 7; ++i) cr[i] = 0

    // Search through bytes for timestamp which starts after the first '[' bracket
    // Note timestamp_a only became a full timestamp (with year and month) in version 0.46.1
    while (cr[3] !== '['.charCodeAt(0)) {
      cr[0] = cr[1]
      cr[1] = cr[2]
      cr[2] = cr[3]
      cr[3] = this._fgeti()
    }
    cr[0] = cr[1]
    cr[1] = cr[2]
    cr[2] = cr[3]
    cr[3] = this._fgeti()

    // See if Questionmark option was turned on
    if (cr[0] != 17 && cr[0] != 127) return 0
    this.qm = (cr[0] === 17)

    // Throw away the next byte (the first '[' before timestamp)
    this._fgetc()

    // Fetch timestamp
    // Timestamp_a is when game starts, Timestamp_b is when game ends
    // Custom games add extra bytes here such as "W8H8M32" which need to be ignored
    if (this.mode == 4) {
      i = 0
      while (i < this.MAX_NAME) {
        if ((this.customdata[i++] = this._fgetc()) === '|') {
          this.customdata.pop()
          break
        }
      }
      i = 0
      while (i < this.MAX_NAME) {
        if ((this.timestamp_a[i++] = this._fgetc()) === '|') {
          this.timestamp_a.pop()
          break
        }
      }
    } else {
      i = 0
      while (i < this.MAX_NAME) {
        if ((this.timestamp_a[i++] = this._fgetc()) === '|') {
          this.timestamp_a.pop()
          break
        }
      }
    }

    // Throw away bytes until you find letter B which is followed by the 3bv value
    while (this._fgetc() !== 'B') {
    }

    // Clear the 8 byte array we are using to store data
    for (i = 0; i < 7; ++i) cr[i] = 0
    i = 0

    // Fetch 3BV
    while (c = this._fgeti()) {
      if (c === 'T'.charCodeAt(0)) break
      cr[i] = c
      i++
    }

    // Convert array string to an integer
    this.bbbv = AVFVideo.atoi(cr.join())

    // Clear the 8 byte array we are using to store data
    for (i = 0; i < 7; ++i) cr[i] = 0
    i = 0

    // Fetch the seconds part of time (stop at decimal) and subtract 1s for real time
    while (c = this._fgeti()) {
      if (c === '.'.charCodeAt(0) || c === ','.charCodeAt(0)) break
      cr[i] = c
      i++
    }

    // Convert array string to an integer
    this.score_sec = AVFVideo.atoi(cr.join()) - 1

    // Clear the 8 byte array we are using to store data
    for (i = 0; i < 7; ++i) cr[i] = 0
    i = 0

    // Fetch the decimal part of Time (2 decimal places)
    while (c = this._fgeti()) {
      if (c === ']'.charCodeAt(0)) break
      cr[i] = c
      i++
    }

    // Convert array string to an integer
    this.score_hun = AVFVideo.atoi(cr.join())

    // Clear the 8 byte array we are using to store data
    for (i = 0; i < 7; ++i) cr[i] = 0

    // This skips bytes until first mouse event takes place
    while (cr[2] !== 1 || cr[1] > 1) {
      cr[0] = cr[1]
      cr[1] = cr[2]
      cr[2] = this._fgeti()
    }
    for (i = 3; i < 8; ++i) cr[i] = this._fgeti()

    // Each iteration reads one mouse event
    while (1) {
      const event = this.video[cur]
      this.video[cur].mouse = cr[0]
      this.video[cur].x = cr[1] * 256 + cr[3]
      this.video[cur].y = cr[5] * 256 + cr[7]
      this.video[cur].sec = cr[6] * 256 + cr[2] - 1
      this.video[cur].hun = cr[4]

      if (this.video[cur].sec < 0) break

      for (i = 0; i < 8; ++i) cr[i] = this._fgeti()
      ++cur
    }

    // Number of game events
    this.size = cur

    // Clear a 4 byte array
    for (i = 0; i < 3; ++i) cr[i] = 0

    // Find 'cs=' in the video file (this identifies start of text at end of video)
    while (cr[0] !== 'c'.charCodeAt(0) || cr[1] !== 's'.charCodeAt(0) || cr[2] !== '='.charCodeAt(0)) {
      cr[0] = cr[1]
      cr[1] = cr[2]
      cr[2] = this._fgeti()
    }

    // Throw away the bytes after "cs=" but before "Realtime"
    for (i = 0; i < 17; ++i) this._fgetc()

    // Infinite loop until break statement is made
    // Note that Realtime and Skin do not exist before version 0.47
    while (1) {
      this.getpair(this.name, this.value)
      // Stop grabbing pairs of data once Skin has been read
      if (this.value[0]) {
        // If name is Skin then strcmp returns 0, using !strcmp returns 1
        if (!(this.name.join().trim() === 'Skin')) {
          // The addition of 1 removes the leading whitespace
          this.skin = this.value.slice(1)
        }
      } else {
        break
      }
    }

    // Fetch Program
    i = 0
    while (i < this.MAX_NAME) {
      if ((this.program[i++] = this._fgetc()) === '0') {
        this.program.length = --i
        break
      }
    }

    // Start the process of fetching Version, such as '0.52.3'
    // Since we print 0 later and already fetched 52 as ver, throw away the '.52'
    i = 0
    for (i = 0; i < 3; ++i) this._fgetc()

    // Store next byte which will be a period or blank space depending on version
    this.spacer = this._fgetc()

    // Fetch 10 more bytes (this is longer than longest known last part of version)
    // Read into an array (ie, '0.52.3. Copyright' would put '3. Copyrig' in array)
    for (i = 0; i < 10; ++i) {
      this.versionend[i] = this._fgetc()
    }

    // Second step is transfer to a different array then parse up until the period or Copyright
    // Versions since 0.43 end with a period before the Copyright notice (ie, '0.43 demo3.')
    for (i = 0; i < this.MAX_NAME; ++i) {
      if (this.versionend[i] !== '.' && this.versionend[i] !== 'C') {
        this.versionprint[i] = this.versionend[i]
      }
    }
    return 1
  }
}

// #include <stdio.h>
// #include <stdlib.h>
// #include <string.h>
//
// #define MAXREP 100000
// #define MAXNAME 1000
//
// struct event
// {
//   //Seconds, hundredths, thousandths
//   int sec,hun,ths;
//   int x,y;
//   int mouse;
// };
// typedef struct event event;
//
//
// FILE* AVF;
//
// //Initialise global variables
// int mode,w,h,m;					//Mode, Width, Height, Mines
// int size;						//Number of game events
// int* board;						//Stores board and mine locations
// int qm;							//Questionmarks
// int ver;						//Version
// char name[MAXNAME];				//Player name
// char skin[MAXNAME];				//Skin (since version 0.47)
// char program[MAXNAME];			//Program
// char value[MAXNAME];			//Used in getpair() function
// char timestamp_a[MAXNAME];		//Timestamp (when game started)
// char customdata[MAXNAME];		//Custom games have 4 extra bytes
// event video[MAXREP];			//Game events
// int score_sec,score_hun;		//Time in seconds and decimals
// char spacer;					//The period or space before 3rd part of Version
// char versionend[MAXNAME];		//Substring used to fetch Version
// char versionprint[MAXNAME];		//Substring used to fetch Version
// int bbbv;						//3bv
// float realtime;					//Realtime (since version 0.47)
// float bbbvs;					//3bvs
//
//
//
// //==============================================================================================
// //Function asks user to exit after program has run successfully
// //==============================================================================================
// void pause()
// {
//   //fprintf(stderr,"Press enter to exit\n");
//   //while(getchar()!='\n');
// }
//
//
// //==============================================================================================
// //Function is run if there is a parsing error
// //==============================================================================================
// _fgetc(FILE* f)
// {
//   if(!feof(f)) return fgetc(f); else
//   {
//     printf("Error 4: Unexpected end of file\n");
//     exit(1);
//   }
// }
//
//
// //==============================================================================================
// //Function is used to read Realtime and Skin values
// //==============================================================================================
// void getpair(FILE* f,char* c1,char* c2)
// {
//   //Initialise local variables
//   int i=0;
//   char c=0;
//
//   while(c!=':' && c!=13 && i<MAX_NAME)
//   {
//     c=_fgetc(f);
//     if(c=='<')
//     {
//       c1[i]=c2[0]=0;
//       while(_fgetc(f)!=13);
//       return;
//     }
//     c1[i++]=c;
//   }
//   c1[--i]=0;i=0;
//
//   while(c!=13 && i<MAX_NAME)
//   {
//     c=_fgetc(f);
//     c2[i++]=c;
//   }
//   c2[i]=0;
// }
//
//
// //==============================================================================================
// //Function is used to read video data
// //==============================================================================================
// int readavf()
// {
//   //Initialise local variables
//   int i,cur=0;
//   unsigned char c,d;
//   //Create an 8 byte array to store data
//   unsigned char cr[8];
//
//   //Fetch main version from byte 1
//   //For example, Arbiter 0.52.2 stores 52 (Hex 34) in byte 1
//   c=this._fgetc();
//   ver=c;
//
//   //Throw away next 4 bytes which are not used
//   for(i=0;i<4;++i) c=this._fgetc();
//
//   //Fetch Mode from byte 6
//   c=this._fgetc();
//   mode=c-2;
//
//   if(mode==1)
//   {
//     w=h=8;m=10;
//   }
//   else if(mode==2)
//   {
//     w=h=16;m=40;
//   }
//   else if(mode==3)
//   {
//     w=30;h=16;m=99;
//   }
//   else if(mode==4)
//   {
//     w=(c=this._fgetc())+1;
//     h=(c=this._fgetc())+1;
//     m=(c=this._fgetc());
//     m=m*256+(c=this._fgetc());
//   }
//   else return 0;
//
//   //Fetch board layout and put in memory
//   board=(int*)malloc(sizeof(int)*w*h);
//   for(i=0;i<w*h;++i) board[i]=0;
//   for(i=0;i<m;++i)
//   {
//     c=this._fgetc()-1;
//     d=this._fgetc()-1;
//     board[c*w+d]=1;
//   }
//
//   //Clear the 8 byte array we are using to store data
//   for(i=0;i<7;++i) cr[i]=0;
//
//   //Search through bytes for timestamp which starts after the first '[' bracket
//   //Note timestamp_a only became a full timestamp (with year and month) in version 0.46.1
//   while(cr[3]!='[')
//   {
//     cr[0]=cr[1];cr[1]=cr[2];cr[2]=cr[3];cr[3]=this._fgetc();
//   }
//   cr[0]=cr[1];cr[1]=cr[2];cr[2]=cr[3];cr[3]=this._fgetc();
//
//   //See if Questionmark option was turned on
//   if(cr[0]!=17 && cr[0]!=127) return 0;
//   qm=(cr[0]==17);
//
//   //Throw away the next byte (the first '[' before timestamp)
//   this._fgetc();
//
//   //Fetch timestamp
//   //Timestamp_a is when game starts, Timestamp_b is when game ends
//   //Custom games add extra bytes here such as "W8H8M32" which need to be ignored
//   if(mode==4)
//   {
//     i=0;
//     while(i<MAX_NAME) if((customdata[i++]=this._fgetc())=='|')
//     {customdata[--i]=0;break;}
//     i=0;
//     while(i<MAX_NAME) if((timestamp_a[i++]=this._fgetc())=='|')
//     {timestamp_a[--i]=0;break;}
//   }
//   else
//   {
//     i=0;
//     while(i<MAX_NAME) if((timestamp_a[i++]=this._fgetc())=='|')
//     {timestamp_a[--i]=0;break;}
//   }
//
//   //Throw away bytes until you find letter B which is followed by the 3bv value
//   while(this._fgetc()!='B');
//
//   //Clear the 8 byte array we are using to store data
//   for(i=0;i<7;++i) cr[i]=0;
//   i=0;
//
//   //Fetch 3BV
//   while(c=this._fgetc())
//   {
//     if (c=='T') break;
//     cr[i]=c;i++;
//   }
//
//   //Convert array string to an integer
//   bbbv=atoi(cr);
//
//   //Clear the 8 byte array we are using to store data
//   for(i=0;i<7;++i) cr[i]=0;
//   i=0;
//
//   //Fetch the seconds part of time (stop at decimal) and subtract 1s for real time
//   while(c=this._fgetc())
//   {
//     if (c=='.'||c==',') break;
//     cr[i]=c;i++;
//   }
//
//   //Convert array string to an integer
//   score_sec=atoi(cr)-1;
//
//   //Clear the 8 byte array we are using to store data
//   for(i=0;i<7;++i) cr[i]=0;
//   i=0;
//
//   //Fetch the decimal part of Time (2 decimal places)
//   while(c=this._fgetc())
//   {
//     if (c==']') break;
//     cr[i]=c;i++;
//   }
//
//   //Convert array string to an integer
//   score_hun=atoi(cr);
//
//   //Clear the 8 byte array we are using to store data
//   for(i=0;i<7;++i) cr[i]=0;
//
//   //This skips bytes until first mouse event takes place
//   while(cr[2]!=1 || cr[1]>1)
//   {
//     cr[0]=cr[1];cr[1]=cr[2];cr[2]=this._fgetc();
//   }
//   for(i=3;i<8;++i) cr[i]=this._fgetc();
//
//   //Each iteration reads one mouse event
//   while(1)
//   {
//     video[cur].mouse=cr[0];
//     video[cur].x=(int)cr[1]*256+cr[3];
//     video[cur].y=(int)cr[5]*256+cr[7];
//     video[cur].sec=(int)cr[6]*256+cr[2]-1;
//     video[cur].hun=cr[4];
//
//     if(video[cur].sec<0) break;
//
//     for(i=0;i<8;++i) cr[i]=this._fgetc();
//     ++cur;
//   }
//
//   //Number of game events
//   size=cur;
//
//   //Clear a 4 byte array
//   for(i=0;i<3;++i) cr[i]=0;
//
//   //Find 'cs=' in the video file (this identifies start of text at end of video)
//   while(cr[0]!='c' || cr[1]!='s' || cr[2]!='=')
//   {
//     cr[0]=cr[1];cr[1]=cr[2];cr[2]=this._fgetc();
//   }
//
//   //Throw away the bytes after "cs=" but before "Realtime"
//   for(i=0;i<17;++i) this._fgetc();
//
//   //Initialise skin
//   skin[0]=0;
//
//   //Infinite loop until break statement is made
//   //Note that Realtime and Skin do not exist before version 0.47
//   while(1)
//   {
//     getpair(AVF,name,value);
//     //Stop grabbing pairs of data once Skin has been read
//     if(value[0])
//     {
//       //If name is Skin then strcmp returns 0, using !strcmp returns 1
//       if(!strcmp(name,"Skin"))
//       {
//         //The addition of 1 removes the leading whitespace
//         strcpy(skin,value+1);
//       }
//     }
//     else
//       break;
//   }
//
//   //Fetch Program
//   i=0;
//   while(i<MAX_NAME)
//     if((program[i++]=this._fgetc())=='0')
//     {
//       program[--i]=0;
//       break;
//     }
//
//   //Start the process of fetching Version, such as '0.52.3'
//   //Since we print 0 later and already fetched 52 as ver, throw away the '.52'
//   i=0;
//   for(i=0;i<3;++i) this._fgetc();
//
//   //Store next byte which will be a period or blank space depending on version
//   spacer=this._fgetc();
//
//   //Fetch 10 more bytes (this is longer than longest known last part of version)
//   //Read into an array (ie, '0.52.3. Copyright' would put '3. Copyrig' in array)
//   for(i=0;i<10;++i)
//   {
//     versionend[i]=this._fgetc();
//   }
//
//   //Second step is transfer to a different array then parse up until the period or Copyright
//   //Versions since 0.43 end with a period before the Copyright notice (ie, '0.43 demo3.')
//   for(i=0;i<MAX_NAME;++i)
//   {
//     if(versionend[i]!='.' && versionend[i]!='C')
//       versionprint[i]=versionend[i];
//   }
//   return 1;
// }
//
//
// //==============================================================================================
// //Function is used to print video data
// //==============================================================================================
// void writetxt()
// {
//   //Initialise local variables
//   int i,j;
//   int curx,cury;
//   const char* level_names[]={"null","Beginner","Intermediate","Expert","Custom"};
//   const char* mode_names[]={"null","Classic","Classic","Classic","Density"};
//
//   //Code version and Program
//   printf("RawVF_Version: Rev6\n");
//   printf("Program: %s\n",program);
//
//   //Print Version details
//   //Prints first two parts of version (ie., '0.52')
//   printf("Version: 0.%d",ver);
//
//   //Prints third part of version if it exists (ie, '.3' or ' DEBUG')
//   if(versionprint[0]!=' ' && spacer=='.')
//   {
//     printf(".%s\n",versionprint);
//   }
//   else if(versionprint[0]!=' '&& spacer==' ')
//   {
//     printf(" %s\n",versionprint);
//   }
//   else printf("\n");
//
//   //Print Player
//   printf("Player: %s\n",name);
//
//   //Print grid details
//   printf("Level: %s\n",level_names[mode]);
//   printf("Width: %d\n",w);
//   printf("Height: %d\n",h);
//   printf("Mines: %d\n",m);
//
//   //Print Marks
//   if(!qm)printf("Marks: Off\n");
//   else {printf("Marks: On\n");}
//
//   //Print Time
//   //If score_hun starts with a 0 the 0 is dropped to prevent a calculation bug
//   realtime=((score_sec*100)+(score_hun));
//   realtime=realtime/100;
//   printf("Time: %.03f\n",realtime);
//
//   //Print 3bv
//   printf("BBBV: %d\n",bbbv);
//
//   //Calculate 3bvs
//   bbbvs=(bbbv*100000)/((score_sec*100)+(score_hun));
//   bbbvs=bbbvs/1000;
//   printf("BBBVS: %.03f\n",bbbvs);
//
//   //Print Timestamp
//   printf("Timestamp: %s\n",timestamp_a);
//
//   //Print Mode
//   printf("Mode: %s\n",mode_names[mode]);
//
//   //Print Skin
//   if(skin) printf("Skin: %s\n",skin);
//   else {printf("Skin: '%s\n"," ");}
//
//   //Print Board
//   printf("Board:\n");
//   for(i=0;i<h;++i)
//   {
//     for(j=0;j<w;++j)
//       if(board[i*w+j])
//         printf("*");
//       else
//         printf("0");
//     printf("\n");
//   }
//
//   //Print Mouse events
//   printf("Events:\n");
//   curx=cury=-1;
//
//   for(i=0;i<size;++i)
//   {
//     if(video[i].mouse==1 && video[i].x==curx && video[i].y==cury) continue;
//     curx=video[i].x;cury=video[i].y;
//
//     //For consistency with other programs add fake 0 as third decimal
//     printf("%d.%02d0 ",video[i].sec,video[i].hun);
//
//     if(video[i].mouse==1)
//       printf("mv ");
//     else if(video[i].mouse==3)
//       printf("lc ");
//     else if(video[i].mouse==5)
//       printf("lr ");
//     else if(video[i].mouse==9)
//       printf("rc ");
//     else if(video[i].mouse==17)
//       printf("rr ");
//     else if(video[i].mouse==33)
//       printf("mc ");
//     else if(video[i].mouse==65)
//       printf("mr ");
//     else if(video[i].mouse==145)
//       printf("rr ");
//     else if(video[i].mouse==193)
//       printf("mr ");
//     else if(video[i].mouse==11)
//       printf("sc ");
//     else if(video[i].mouse==21)
//       printf("lr ");
//     printf("%d %d (%d %d)\n",video[i].x/16+1,video[i].y/16+1,video[i].x,video[i].y);
//   }
// }
//
//
//
// //==============================================================================================
// //Run program and display any error messages
// //==============================================================================================
// int main(int argc,char** argv)
// {
//   //Program can be run in command line as "program video.avf>output.txt"
//   //The output file is optional if you prefer printing to screen
//   if(argc<2)
//   {
//     printf("Error 1: Name of input file missing\n");
//     printf("Usage: %s <input avf> [nopause]\n",argv[0]);
//     pause();
//     return 0;
//   }
//
//   //Open video file
//   AVF=fopen(argv[1],"rb");
//
//   //Error if video is not an AVF file
//   if(!AVF)
//   {
//     printf("Error 2: Could not open AVF\n");
//     return 1;
//   }
//
//   //Error if video parsing fails
//   if(!readavf())
//   {
//     printf("Error 3: Invalid AVF\n");
//     return 1;
//   }
//
//   //Print results, close file and free memory
//   writetxt();
//   fclose(AVF);free(board);
//
//   //Program ends with message to exit
//   if(argc==2) pause();
//   return 0;
// }
//