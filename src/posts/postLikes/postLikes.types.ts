export class postLikeDBType {
  public addedAt: Date;
  constructor(
    public userId: string,
    public postId: string,
    public likeStatus: string,
    public login: string = 'string',
  ) {
    this.addedAt = new Date();
  }
}

export class postLikeViewType {
  public addedAt: Date;
  constructor(
    public userId: string,
    public login: string = 'string',
  ) {
    this.addedAt = new Date();
  }
}

//
