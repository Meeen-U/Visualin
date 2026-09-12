from fastapi import Query


def paging_query(
    page: int = Query(1, ge=1, description="ページ番号（1始まり）"),
    page_size: int = Query(20, ge=1, le=100, description="1ページあたりの件数"),
) -> tuple[int, int]:
    """一覧API共通のページングパラメータ"""
    return page, page_size


def paginate(query, page: int, page_size: int):
    """クエリに offset/limit を適用し、件数と該当ページの行を返す"""
    total = query.count()
    offset = (page - 1) * page_size
    rows = query.offset(offset).limit(page_size).all()
    return rows, total
