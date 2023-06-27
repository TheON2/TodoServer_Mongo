# TodoServer_Mongo

주어진게 json-server라 LV4 까진 json server를 쓰긴 했는데

솔직히 이걸로 끝까지 가는건 너무 비효율 적인거 같아 몽고db 서버를 하나 팠습니다...


1. **addTodo**
    - **URI**: `${process.env.REACT_APP_LOCAL_SERVER}/todos`
    - **Method**: POST
    - **Description**: 새로운 할 일을 추가합니다.
    - **Payload**: `newTodo` - 새로 추가될 할 일의 정보를 담은 객체입니다.

2. **getTodos**
    - **URI**: `${process.env.REACT_APP_LOCAL_SERVER}/todos`
    - **Method**: GET
    - **Description**: 모든 할 일을 가져옵니다.

3. **updateDoneTodo**
    - **URI**: `${process.env.REACT_APP_LOCAL_SERVER}/todos/{id}`
    - **Method**: PATCH
    - **Description**: 할 일의 완료 상태를 업데이트합니다.
    - **Params**: `id` - 업데이트할 할 일의 ID입니다.
    - **Payload**: `{done:!(todo.done)}` - 완료 상태를 반전시키는 객체입니다.

4. **updateTodo**
    - **URI**: `${process.env.REACT_APP_LOCAL_SERVER}/todos/{id}`
    - **Method**: PATCH
    - **Description**: 할 일의 내용을 업데이트합니다.
    - **Params**: `id` - 업데이트할 할 일의 ID입니다.
    - **Payload**: `{content:sendData.content}` - 할 일의 새로운 내용을 담은 객체입니다.

5. **deleteTodo**
    - **URI**: `${process.env.REACT_APP_LOCAL_SERVER}/todos/{id}`
    - **Method**: DELETE
    - **Description**: 특정 할 일을 삭제합니다.
    - **Params**: `id` - 삭제할 할 일의 ID입니다.

