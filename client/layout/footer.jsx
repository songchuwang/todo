import '../assets/styles/footer.css'
export default {
  data () {
    return {
      author: 'songchuwang'
    }
  },
  render () {
    return (
      <div id="footer">
        <span>Written by {this.author}</span>
      </div>
    )
  }
}
