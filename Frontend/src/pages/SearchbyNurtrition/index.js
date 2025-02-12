import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import SearchNutritionScroll from "../../components/SearchNutritionScroll";
import './style.css'

const SearchbyNurtrition = () => {
    return (
    <div className="searchbynurtritioncontents">
        <div className="nutritionheader"><HeaderContainer/></div>
        <div className="nutritionScroll"><SearchNutritionScroll/></div>
    </div>
)
}

export default SearchbyNurtrition