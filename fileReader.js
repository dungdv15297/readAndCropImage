/**
 * 画像の選択フォームを表示し、ユーザが選択した画像を一つだけ読み込み、パスとファイルオブジェクトを保持するオブジェクトを返す
 */
const readImageFromDevice = () => {
  const input = document.createElement('input')
  input.setAttribute('type', 'file')
  input.setAttribute('accept', 'image/png, image/jpeg, image/jpg, image/gif')

  return new Promise((resolve, reject) => {
    input.onchange = (event) => {
      const file = event.target.files[0]
      try {
        const reader = new FileReader()
        reader.onload = () => {
          resolve({
            path: reader.result,
            data: file,
          })
        }
        reader.readAsDataURL(file)
      } catch (error) {
        // TODO アップロードされる画像をbase64に変換できない場合のエラー処理を追加する
        reject(error)
      }
    }
    input.click()
  })
}

// module.exports = {
//   readImageFromDevice,
// }
