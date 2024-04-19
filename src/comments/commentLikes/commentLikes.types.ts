export class commentLikeDBType {
  constructor(
    public userId: string,
    public commentId: string,
    public likeStatus: string,
  ) {}
}
